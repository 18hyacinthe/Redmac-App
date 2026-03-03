import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Search, Navigation, Mic } from 'lucide-react-native';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, SHADOWS, CATEGORY_VISUALS, MAP_COLORS } from '@/constants/theme';
import { useData } from '@/providers/DataProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { PointFilters } from '@/types';
import { useRouter } from 'expo-router';
import GlassSurface from '@/components/GlassSurface';
import FloatingHomeButton from '@/components/FloatingHomeButton';
import { ShoppingBag, Newspaper, Coffee, ShoppingCart, Store } from 'lucide-react-native';

const MOROCCO_CENTER = { latitude: 31.7917, longitude: -7.0926 };

const CATEGORY_ICONS = [
    { key: 'Epicerie', alt: 'EPICERIE', Icon: ShoppingBag, color: CATEGORY_VISUALS.EPICERIE.color },
    { key: 'Kiosque', alt: 'KIOSQUE', Icon: Newspaper, color: CATEGORY_VISUALS.KIOSQUE.color },
    { key: 'Café', alt: 'CAFE', Icon: Coffee, color: CATEGORY_VISUALS.CAFE.color },
    { key: 'Boulangerie', alt: 'VENDEUR_AMBULANT', Icon: ShoppingCart, color: CATEGORY_VISUALS.VENDEUR_AMBULANT.color },
    { key: 'Autre', alt: 'AUTRE', Icon: Store, color: CATEGORY_VISUALS.AUTRE.color },
];

const STATUS_DOTS = [
    { key: 'VALIDE', color: MAP_COLORS.valide },
    { key: 'EN_ATTENTE', color: MAP_COLORS.enAttente },
];

export default function MapScreen() {
    const router = useRouter();
    const { points } = useData();
    const { t } = useLanguage();
    const webViewRef = useRef<WebView>(null);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<{ categorie: string | null; statut: string | null }>({
        categorie: null,
        statut: null,
    });
    const [locationLoading, setLocationLoading] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => { requestLocation(); }, []);

    const requestLocation = async () => {
        try {
            if (Platform.OS === 'web') {
                navigator.geolocation?.getCurrentPosition(
                    (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                    () => { }
                );
            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                }
            }
        } catch (e) { console.error('Location error:', e); }
    };

    const handleMyLocation = async () => {
        setLocationLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            if (Platform.OS === 'web') {
                navigator.geolocation?.getCurrentPosition(
                    (pos) => {
                        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                        setUserLocation(loc);
                        sendToMap(`flyTo(${loc.latitude}, ${loc.longitude})`);
                        setLocationLoading(false);
                    },
                    () => setLocationLoading(false)
                );
            } else {
                const loc = await Location.getCurrentPositionAsync({});
                setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                sendToMap(`flyTo(${loc.coords.latitude}, ${loc.coords.longitude})`);
                setLocationLoading(false);
            }
        } catch (e) { setLocationLoading(false); }
    };

    const getMarkerColor = (statut: string) => {
        switch (statut) {
            case 'VALIDE': return MAP_COLORS.valide;
            case 'EN_ATTENTE': return MAP_COLORS.enAttente;
            case 'REJETE': return MAP_COLORS.rejete;
            default: return PALETTE.clay[500];
        }
    };

    const filteredPoints = points.filter(point => {
        if (filters.statut && point.statut !== filters.statut) return false;
        if (filters.categorie && point.categorie?.toLowerCase() !== filters.categorie.toLowerCase()) return false;
        if (point.statut === 'REJETE') return false;
        if (search) {
            const s = search.toLowerCase();
            return (
                point.nom_affiche?.toLowerCase().includes(s) ||
                point.nom?.toLowerCase().includes(s) ||
                point.ville?.toLowerCase().includes(s) ||
                point.zone?.toLowerCase().includes(s) ||
                point.quartier?.toLowerCase().includes(s) ||
                point.adresse?.toLowerCase().includes(s)
            );
        }
        return true;
    });

    const sendToMap = useCallback((js: string) => {
        if (webViewRef.current && mapReady) {
            webViewRef.current.injectJavaScript(`${js}; true;`);
        }
    }, [mapReady]);

    useEffect(() => {
        if (!mapReady) return;
        const markersData = filteredPoints.map(p => ({
            id: p.id, lat: p.latitude, lng: p.longitude,
            color: getMarkerColor(p.statut || 'EN_ATTENTE'),
            name: p.nom_affiche || p.nom || 'Point de vente',
            status: p.statut || 'EN_ATTENTE',
        }));
        sendToMap(`updateMarkers(${JSON.stringify(markersData)})`);
    }, [filteredPoints, mapReady]);

    useEffect(() => {
        if (!mapReady || !userLocation) return;
        sendToMap(`setUserLocation(${userLocation.latitude}, ${userLocation.longitude})`);
    }, [userLocation, mapReady]);

    const handleWebViewMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerPress') router.push(`/point/${data.id}` as any);
            else if (data.type === 'mapReady') setMapReady(true);
        } catch (e) { }
    };

    const toggleCategoryFilter = (cat: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilters(f => ({ ...f, categorie: f.categorie === cat ? null : cat }));
    };

    const toggleStatusFilter = (stat: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilters(f => ({ ...f, statut: f.statut === stat ? null : stat }));
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
      width: 28px; height: 28px; border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.9);
      animation: markerAppear 0.4s ease-out;
    }
    .marker-pending {
      animation: markerPulse 2s ease-in-out infinite;
    }
    .user-marker {
      width: 16px; height: 16px; border-radius: 50%;
      background: #4285F4;
      border: 3px solid white;
      box-shadow: 0 0 0 2px rgba(66,133,244,0.3), 0 2px 6px rgba(0,0,0,0.3);
    }
    @keyframes markerAppear {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes markerPulse {
      0%, 100% { box-shadow: 0 0 8px rgba(212,163,115,0.3), 0 2px 6px rgba(0,0,0,0.15); }
      50% { box-shadow: 0 0 18px rgba(212,163,115,0.6), 0 2px 6px rgba(0,0,0,0.15); }
    }
    .popup-content { font-family: -apple-system, sans-serif; min-width: 140px; }
    .popup-content h3 { font-size: 14px; margin: 0 0 4px; color: #2D1810; }
    .popup-content .tap-hint { font-size: 11px; color: #C65D3B; margin-top: 6px; font-weight: 600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false })
      .setView([${MOROCCO_CENTER.latitude}, ${MOROCCO_CENTER.longitude}], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var markers = [];
    var userMarker = null;

    function createIcon(color, status) {
      var cls = 'custom-marker' + (status === 'EN_ATTENTE' ? ' marker-pending' : '');
      var shadow = status === 'EN_ATTENTE'
        ? '0 0 12px rgba(212,163,115,0.4), 0 2px 8px rgba(0,0,0,0.15)'
        : '0 0 12px ' + color + '66, 0 2px 8px rgba(0,0,0,0.15)';
      return L.divIcon({
        className: '',
        html: '<div class="' + cls + '" style="background:' + color + ';box-shadow:' + shadow + '"></div>',
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -18]
      });
    }

    function updateMarkers(data) {
      markers.forEach(function(m) { map.removeLayer(m); });
      markers = [];
      data.forEach(function(p) {
        var marker = L.marker([p.lat, p.lng], { icon: createIcon(p.color, p.status) })
          .addTo(map)
          .bindPopup('<div class="popup-content"><h3>' + p.name + '</h3><p class="tap-hint">→</p></div>');
        marker.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: p.id }));
        });
        markers.push(marker);
      });
    }

    function setUserLocation(lat, lng) {
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([lat, lng], {
        icon: L.divIcon({ className: '', html: '<div class="user-marker"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
        zIndexOffset: 1000
      }).addTo(map);
    }

    function flyTo(lat, lng) { map.flyTo([lat, lng], 15, { duration: 1.5 }); }

    map.whenReady(function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
    });
  </script>
</body>
</html>
  `;

    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                <Text style={styles.webFallback}>{t('map', 'loading')}</Text>
                <FloatingHomeButton />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: leafletHTML }}
                style={styles.map}
                onMessage={handleWebViewMessage}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={PALETTE.clay[500]} />
                        <Text style={styles.loadingText}>{t('map', 'loading')}</Text>
                    </View>
                )}
            />

            {/* Search bar */}
            <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                    <Search size={20} color={PALETTE.text.tertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('map', 'search')}
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor={PALETTE.text.tertiary}
                    />
                    <TouchableOpacity style={styles.micButton}>
                        <Mic size={18} color={PALETTE.clay[500]} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter strip */}
            <View style={styles.filterStrip}>
                <View style={styles.filterRow}>
                    {CATEGORY_ICONS.map(({ key, Icon, color }) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.filterIcon,
                                filters.categorie === key && { backgroundColor: color, borderColor: color },
                            ]}
                            onPress={() => toggleCategoryFilter(key)}
                        >
                            <Icon size={18} color={filters.categorie === key ? PALETTE.white : color} />
                        </TouchableOpacity>
                    ))}
                    <View style={styles.filterDivider} />
                    {STATUS_DOTS.map(({ key, color }) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.statusDot,
                                { backgroundColor: filters.statut === key ? color : 'transparent', borderColor: color },
                            ]}
                            onPress={() => toggleStatusFilter(key)}
                        />
                    ))}
                </View>
            </View>

            {/* My location FAB */}
            <TouchableOpacity
                style={styles.locationButton}
                onPress={handleMyLocation}
                disabled={locationLoading}
            >
                {locationLoading ? (
                    <ActivityIndicator size="small" color={PALETTE.text.inverse} />
                ) : (
                    <Navigation size={24} color={PALETTE.text.inverse} />
                )}
            </TouchableOpacity>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: MAP_COLORS.valide }]} />
                    <Text style={styles.legendText}>{t('map', 'validated')}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: MAP_COLORS.enAttente }]} />
                    <Text style={styles.legendText}>{t('map', 'pending')}</Text>
                </View>
            </View>

            <FloatingHomeButton />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PALETTE.sand[100],
    },
    map: { flex: 1 },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PALETTE.sand[100],
    },
    loadingText: {
        marginTop: 12,
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: PALETTE.text.tertiary,
    },
    searchRow: {
        position: 'absolute',
        top: 56,
        left: SPACING.base,
        right: SPACING.base,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PALETTE.glass.white,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: PALETTE.glass.whiteBorder,
        ...SHADOWS.soft,
    },
    searchInput: {
        flex: 1,
        fontSize: TYPOGRAPHY.size.base,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.primary,
    },
    micButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: PALETTE.sand[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterStrip: {
        position: 'absolute',
        top: 120,
        left: SPACING.base,
        right: SPACING.base,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PALETTE.glass.white,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: PALETTE.glass.whiteBorder,
        ...SHADOWS.soft,
    },
    filterIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: PALETTE.sand[300],
        backgroundColor: PALETTE.white,
    },
    filterDivider: {
        width: 1,
        height: 28,
        backgroundColor: PALETTE.sand[300],
        marginHorizontal: SPACING.xs,
    },
    statusDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2.5,
    },
    locationButton: {
        position: 'absolute',
        right: SPACING.base,
        bottom: 100,
        backgroundColor: PALETTE.clay[500],
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    legend: {
        position: 'absolute',
        bottom: 70,
        left: SPACING.base,
        backgroundColor: PALETTE.glass.white,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        flexDirection: 'row',
        gap: SPACING.base,
        borderWidth: 1,
        borderColor: PALETTE.glass.whiteBorder,
        ...SHADOWS.soft,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: TYPOGRAPHY.size.xs,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: PALETTE.text.primary,
    },
    webFallback: {
        textAlign: 'center',
        marginTop: 100,
        fontSize: TYPOGRAPHY.size.lg,
        color: PALETTE.text.secondary,
    },
});
