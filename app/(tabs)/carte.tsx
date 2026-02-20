import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Platform, ScrollView } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
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
  const { user, isGuest } = useAuth();
  const [region, setRegion] = useState<Region>(MOROCCO_CENTER);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PointFilters>({
    statut: 'TOUS',
    categorie: 'TOUS',
  });
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setRegion({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
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
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
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
              setRegion({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
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
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
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

  const handleMarkerPress = (point: PointDeVente) => {
    router.push(`/point/${point.id}` as any);
  };

  if (!user && !isGuest) {
    return (
      <View style={styles.authContainer}>
        <MapPin size={64} color={Colors.light.tint} />
        <Text style={styles.authTitle}>Bienvenue sur CarteMa</Text>
        <Text style={styles.authText}>
          Aidez à cartographier les points de vente au Maroc
        </Text>
        <TouchableOpacity 
          style={styles.authButton}
          onPress={() => router.push('/auth/login' as any)}
        >
          <Text style={styles.authButtonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.authButton, styles.guestButton]}
          onPress={() => router.push('/auth/register' as any)}
        >
          <Text style={[styles.authButtonText, styles.guestButtonText]}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        <ScrollView style={styles.webPointsList}>
          {filteredPoints.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={styles.webPointCard}
              onPress={() => handleMarkerPress(point)}
            >
              <View style={[styles.webPointStatus, { backgroundColor: getMarkerColor(point.statut) }]} />
              <View style={styles.webPointContent}>
                <Text style={styles.webPointName}>{point.nom_affiche}</Text>
                <Text style={styles.webPointCategory}>{getCategoryLabel(point.categorie)}</Text>
                {(point.ville || point.quartier) && (
                  <Text style={styles.webPointLocation}>
                    {[point.quartier, point.ville].filter(Boolean).join(', ')}
                  </Text>
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            pinColor={getMarkerColor(point.statut)}
            onPress={() => handleMarkerPress(point)}
          />
        ))}
      </MapView>

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
  searchContainer: {
    position: 'absolute',
    top: 16,
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
    top: 80,
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
  authContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  authButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  guestButtonText: {
    color: Colors.light.tint,
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
