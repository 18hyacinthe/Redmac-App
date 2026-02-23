import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MapPin, Search, Filter, Navigation } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/providers/DataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { PointDeVente, PointFilters } from '@/types';
import { MOROCCO_CENTER, getCategoryLabel, getStatusLabel } from '@/constants/categories';
import { useRouter } from 'expo-router';

export default function CarteScreen() {
  const router = useRouter();
  const { points } = useData();
  const { user } = useAuth();
  const webViewRef = useRef<WebView>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PointFilters>({
    statut: 'TOUS',
    categorie: 'TOUS',
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.log('Geolocation error:', error);
            }
          );
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Error requesting location:', error);
    }
  };

  const handleMyLocation = async () => {
    setLocationLoading(true);
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const loc = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setUserLocation(loc);
              sendToMap(`flyTo(${loc.latitude}, ${loc.longitude})`);
              setLocationLoading(false);
            },
            (error) => {
              console.log('Geolocation error:', error);
              setLocationLoading(false);
            }
          );
        }
      } else {
        const location = await Location.getCurrentPositionAsync({});
        const loc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(loc);
        sendToMap(`flyTo(${loc.latitude}, ${loc.longitude})`);
        setLocationLoading(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
    }
  };

  const getMarkerColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return Colors.map.valide;
      case 'EN_ATTENTE':
        return Colors.map.enAttente;
      case 'REJETE':
        return Colors.map.rejete;
      default:
        return Colors.light.tint;
    }
  };

  const filteredPoints = points.filter(point => {
    if (filters.statut !== 'TOUS' && point.statut !== filters.statut) return false;
    if (filters.categorie !== 'TOUS' && point.categorie !== filters.categorie) return false;
    if (point.statut === 'REJETE' && user?.role !== 'ADMIN') return false;

    if (search) {
      const searchLower = search.toLowerCase();
      return (
        point.nom_affiche.toLowerCase().includes(searchLower) ||
        point.ville?.toLowerCase().includes(searchLower) ||
        point.quartier?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const sendToMap = useCallback((js: string) => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.injectJavaScript(`${js}; true;`);
    }
  }, [mapReady]);

  // Update markers whenever filteredPoints or mapReady changes
  useEffect(() => {
    if (!mapReady) return;
    const markersData = filteredPoints.map(p => ({
      id: p.id,
      lat: p.latitude,
      lng: p.longitude,
      color: getMarkerColor(p.statut),
      name: p.nom_affiche || 'Point de vente',
      category: getCategoryLabel(p.categorie),
      status: getStatusLabel(p.statut),
    }));
    sendToMap(`updateMarkers(${JSON.stringify(markersData)})`);
  }, [filteredPoints, mapReady]);

  // Update user location on map
  useEffect(() => {
    if (!mapReady || !userLocation) return;
    sendToMap(`setUserLocation(${userLocation.latitude}, ${userLocation.longitude})`);
  }, [userLocation, mapReady]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress') {
        router.push(`/point/${data.id}` as any);
      } else if (data.type === 'mapReady') {
        setMapReady(true);
      }
    } catch (e) {
      // ignore
    }
  };

  const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    .custom-marker {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .user-marker {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #4285F4;
      border: 3px solid white;
      box-shadow: 0 0 0 2px rgba(66,133,244,0.3), 0 2px 6px rgba(0,0,0,0.3);
    }
    .popup-content {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-width: 150px;
    }
    .popup-content h3 {
      font-size: 14px;
      margin: 0 0 4px;
      color: #2D1810;
    }
    .popup-content p {
      font-size: 12px;
      margin: 2px 0;
      color: #8B7355;
    }
    .popup-content .tap-hint {
      font-size: 11px;
      color: #C65D3B;
      margin-top: 6px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${MOROCCO_CENTER.latitude}, ${MOROCCO_CENTER.longitude}], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('© OpenStreetMap')
      .addTo(map);

    var markers = [];
    var userMarker = null;

    function createIcon(color) {
      return L.divIcon({
        className: '',
        html: '<div class="custom-marker" style="background:' + color + '"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -16]
      });
    }

    function updateMarkers(data) {
      markers.forEach(function(m) { map.removeLayer(m); });
      markers = [];
      data.forEach(function(p) {
        var marker = L.marker([p.lat, p.lng], { icon: createIcon(p.color) })
          .addTo(map)
          .bindPopup(
            '<div class="popup-content">' +
            '<h3>' + p.name + '</h3>' +
            '<p>' + p.category + '</p>' +
            '<p>' + p.status + '</p>' +
            '<p class="tap-hint">Appuyez pour voir les détails →</p>' +
            '</div>'
          );
        marker.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: p.id }));
        });
        markers.push(marker);
      });
    }

    function setUserLocation(lat, lng) {
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: '<div class="user-marker"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        }),
        zIndexOffset: 1000
      }).addTo(map);
    }

    function flyTo(lat, lng) {
      map.flyTo([lat, lng], 15, { duration: 1.5 });
    }

    map.whenReady(function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
    });
  </script>
</body>
</html>
  `;

  // Web fallback: list view
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webHeader}>
          <MapPin size={32} color={Colors.light.tint} />
          <Text style={styles.webTitle}>Carte des points de vente</Text>
          <Text style={styles.webSubtitle}>
            La carte interactive est disponible sur l&apos;application mobile
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>
        </View>

        <ScrollView style={styles.webPointsList}>
          {filteredPoints.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={styles.webPointCard}
              onPress={() => router.push(`/point/${point.id}` as any)}
            >
              <View style={[styles.webPointStatus, { backgroundColor: getMarkerColor(point.statut) }]} />
              <View style={styles.webPointContent}>
                <Text style={styles.webPointName}>{point.nom_affiche || 'Sans nom'}</Text>
                <Text style={styles.webPointCategory}>{getCategoryLabel(point.categorie)}</Text>
                {point.ville && (
                  <Text style={styles.webPointLocation}>{point.ville} - {point.quartier}</Text>
                )}
              </View>
              <View style={[styles.webStatusBadge, { backgroundColor: getMarkerColor(point.statut) + '20' }]}>
                <Text style={[styles.webStatusText, { color: getMarkerColor(point.statut) }]}>
                  {getStatusLabel(point.statut)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {filteredPoints.length === 0 && (
            <View style={styles.webEmptyState}>
              <MapPin size={48} color={Colors.light.border} />
              <Text style={styles.webEmptyText}>Aucun point trouvé</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // Mobile: OpenStreetMap with Leaflet in WebView
  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: leafletHTML }}
        style={styles.map}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
            <Text style={styles.loadingText}>Chargement de la carte...</Text>
          </View>
        )}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une ville ou quartier..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? Colors.light.card : Colors.light.text} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterTitle}>Statut</Text>
          <View style={styles.filterRow}>
            {(['TOUS', 'VALIDE', 'EN_ATTENTE', user?.role === 'ADMIN' ? 'REJETE' : null].filter(Boolean) as string[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  filters.statut === status && styles.filterChipActive,
                ]}
                onPress={() => setFilters({ ...filters, statut: status as any })}
              >
                <Text style={[
                  styles.filterChipText,
                  filters.statut === status && styles.filterChipTextActive,
                ]}>
                  {status === 'TOUS' ? 'Tous' : getStatusLabel(status as string)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterTitle}>Catégorie</Text>
          <View style={styles.filterRow}>
            {['TOUS', 'EPICERIE', 'KIOSQUE', 'CAFE', 'VENDEUR_AMBULANT', 'AUTRE'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  filters.categorie === cat && styles.filterChipActive,
                ]}
                onPress={() => setFilters({ ...filters, categorie: cat as any })}
              >
                <Text style={[
                  styles.filterChipText,
                  filters.categorie === cat && styles.filterChipTextActive,
                ]}>
                  {cat === 'TOUS' ? 'Tous' : getCategoryLabel(cat as any)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleMyLocation}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color={Colors.light.card} />
        ) : (
          <Navigation size={24} color={Colors.light.card} />
        )}
      </TouchableOpacity>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.map.valide }]} />
          <Text style={styles.legendText}>Validé</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.map.enAttente }]} />
          <Text style={styles.legendText}>En attente</Text>
        </View>
        {user?.role === 'ADMIN' && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.map.rejete }]} />
            <Text style={styles.legendText}>Rejeté</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  filtersPanel: {
    position: 'absolute',
    top: 115,
    left: 16,
    right: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  filterChipTextActive: {
    color: Colors.light.card,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: Colors.light.tint,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  webHeader: {
    backgroundColor: Colors.light.card,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginTop: 12,
  },
  webSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  webPointsList: {
    flex: 1,
    padding: 16,
  },
  webPointCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  webPointStatus: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  webPointContent: {
    flex: 1,
  },
  webPointName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  webPointCategory: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  webPointLocation: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  webStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  webStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  webEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  webEmptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 12,
  },
});
