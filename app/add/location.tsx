import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { ChevronLeft, MapPin, RefreshCw, LogIn } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/providers/AuthProvider';
import StepProgress from '@/components/StepProgress';
import ActionButton from '@/components/ActionButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEP_ICONS = ['📍', '🏪', '📸', '✏️', '✅'];

export default function LocationStep() {
    const router = useRouter();
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (isAuthenticated) getLocation(); }, [isAuthenticated]);

    const getLocation = async () => {
        setLoading(true);
        try {
            if (Platform.OS === 'web') {
                navigator.geolocation?.getCurrentPosition(
                    (pos) => {
                        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                        setLoading(false);
                    },
                    () => setLoading(false)
                );
            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                }
                setLoading(false);
            }
        } catch (e) {
            console.error('Location error:', e);
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem('@add_point_location', JSON.stringify(location));
        router.push('/add/category');
    };

    const miniMapHTML = `
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%;border-radius:24px}</style>
</head><body><div id="map"></div><script>
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([${location.latitude},${location.longitude}],16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
L.marker([${location.latitude},${location.longitude}],{icon:L.divIcon({className:'',html:'<div style="width:20px;height:20px;border-radius:50%;background:#C65D3B;border:3px solid white;box-shadow:0 0 12px rgba(198,93,59,0.5)"></div>',iconSize:[20,20],iconAnchor:[10,10]})}).addTo(map);
</script></body></html>`;

    // Auth gate — must be logged in to add a point
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft size={24} color={PALETTE.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.stepLabel}>{t('add', 'stepOf', { current: 1, total: 5 })}</Text>
                </View>
                <View style={styles.authGate}>
                    <Text style={styles.authGateEmoji}>🔐</Text>
                    <Text style={styles.authGateTitle}>Connexion requise</Text>
                    <Text style={styles.authGateDesc}>
                        Vous devez être connecté pour ajouter un point de vente et gagner des points.
                    </Text>
                    <TouchableOpacity
                        style={styles.authGateBtn}
                        onPress={() => router.push('/auth/login')}
                    >
                        <LogIn size={20} color={PALETTE.text.inverse} />
                        <Text style={styles.authGateBtnText}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.stepLabel}>{t('add', 'stepOf', { current: 1, total: 5 })}</Text>
            </View>

            <StepProgress currentStep={0} totalSteps={5} icons={STEP_ICONS} />

            <View style={styles.content}>
                <Text style={styles.title}>{t('add', 'step1Title')}</Text>

                {/* Map preview */}
                <View style={styles.mapPreview}>
                    {loading ? (
                        <View style={styles.mapLoading}>
                            <ActivityIndicator size="large" color={PALETTE.clay[500]} />
                        </View>
                    ) : Platform.OS === 'web' ? (
                        <View style={styles.mapLoading}>
                            <MapPin size={48} color={PALETTE.clay[500]} />
                            <Text style={styles.coordText}>
                                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                            </Text>
                        </View>
                    ) : (
                        <WebView
                            source={{ html: miniMapHTML }}
                            style={styles.miniMap}
                            scrollEnabled={false}
                            javaScriptEnabled
                        />
                    )}
                </View>

                {/* Location info */}
                <View style={styles.locationInfo}>
                    <MapPin size={20} color={PALETTE.clay[500]} />
                    <Text style={styles.coordText}>
                        {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    </Text>
                    <TouchableOpacity onPress={getLocation} style={styles.refreshBtn}>
                        <RefreshCw size={18} color={PALETTE.clay[500]} />
                        <Text style={styles.refreshText}>{t('add', 'step1Refresh')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* CTA */}
            <View style={styles.footer}>
                <ActionButton
                    icon={<MapPin size={22} color={PALETTE.text.inverse} />}
                    label={t('add', 'step1Btn')}
                    onPress={handleConfirm}
                    variant="primary"
                    disabled={location.latitude === 0}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: PALETTE.sand[100] },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: {
        width: 48, height: 48, borderRadius: RADIUS.sm,
        backgroundColor: PALETTE.glass.white, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    stepLabel: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },
    content: { flex: 1, paddingHorizontal: SPACING.lg },
    title: {
        fontSize: TYPOGRAPHY.size['2xl'], fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.primary, marginBottom: SPACING.lg,
    },
    mapPreview: {
        height: 240, borderRadius: RADIUS.lg, overflow: 'hidden',
        backgroundColor: PALETTE.sand[200], ...SHADOWS.soft,
    },
    miniMap: { flex: 1, borderRadius: RADIUS.lg },
    mapLoading: {
        flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md,
    },
    locationInfo: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        marginTop: SPACING.base, paddingVertical: SPACING.base,
    },
    coordText: {
        flex: 1, fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: PALETTE.text.secondary,
    },
    refreshBtn: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
        padding: SPACING.sm, borderRadius: RADIUS.sm,
    },
    refreshText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.semiBold, color: PALETTE.clay[500],
    },
    footer: { padding: SPACING.lg },

    // Auth gate styles
    authGate: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: SPACING['2xl'],
    },
    authGateEmoji: { fontSize: 56, marginBottom: SPACING.lg },
    authGateTitle: {
        fontSize: TYPOGRAPHY.size.xl, fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.primary, marginBottom: SPACING.sm,
    },
    authGateDesc: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.secondary, textAlign: 'center', lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    authGateBtn: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        backgroundColor: PALETTE.clay[500], borderRadius: RADIUS.md,
        paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.base,
        ...SHADOWS.medium,
    },
    authGateBtnText: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.inverse,
    },
});
