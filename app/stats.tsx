import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft, LogIn, Trophy, CheckCircle, Clock,
    XCircle, MapPin, Award, TrendingUp,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/providers/AuthProvider';
import { AgentStats, PointDeVente } from '@/types';
import api from '@/services/api';
import GlassSurface from '@/components/GlassSurface';
import FloatingHomeButton from '@/components/FloatingHomeButton';

export default function StatsScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
    const [myPoints, setMyPoints] = useState<PointDeVente[]>([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (isAuthenticated) loadMyStats();
        else setIsLoading(false);
    }, [isAuthenticated]);

    const loadMyStats = async () => {
        try {
            setIsLoading(true);
            const res = await api.getMyPoints({ limit: 50 });
            // Verifying we use the agent data from the response as requested
            if (res && res.agent) {
                setAgentStats(res.agent);
                setMyPoints(res.data || []);
                setTotalPoints(res.total || 0);
            }
        } catch (error) {
            console.error('Error loading my stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadMyStats();
        setRefreshing(false);
    }, []);

    // Auth gate
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft size={24} color={PALETTE.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mes Statistiques</Text>
                    <View style={{ width: 48 }} />
                </View>
                <View style={styles.authGate}>
                    <Text style={styles.authGateEmoji}>🔐</Text>
                    <Text style={styles.authGateTitle}>Connexion requise</Text>
                    <Text style={styles.authGateDesc}>
                        Connectez-vous pour voir vos statistiques personnelles et vos points collectés.
                    </Text>
                    <TouchableOpacity
                        style={styles.authGateBtn}
                        onPress={() => router.push('/auth/login')}
                    >
                        <LogIn size={20} color={PALETTE.text.inverse} />
                        <Text style={styles.authGateBtnText}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
                <FloatingHomeButton />
            </SafeAreaView>
        );
    }

    // Loading
    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PALETTE.clay[500]} />
                    <Text style={styles.loadingText}>Chargement de vos données...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case 'VALIDE': return <CheckCircle size={16} color={PALETTE.status.validated} />;
            case 'REJETE': return <XCircle size={16} color={PALETTE.status.rejected} />;
            default: return <Clock size={16} color={PALETTE.status.pending} />;
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'VALIDE': return PALETTE.status.validated;
            case 'REJETE': return PALETTE.status.rejected;
            default: return PALETTE.status.pending;
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case 'VALIDE': return 'Validé';
            case 'REJETE': return 'Rejeté';
            default: return 'En attente';
        }
    };

    const progressPercent = agentStats && agentStats.total_collecte > 0
        ? Math.round((agentStats.nb_valide / agentStats.total_collecte) * 100)
        : 0;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mon Tableau de Bord</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PALETTE.clay[500]} />
                }
            >
                {/* Personal Stats Hub */}
                {agentStats ? (
                    <>
                        <GlassSurface style={styles.scoreCard}>
                            <View style={styles.scoreHeader}>
                                <Trophy size={32} color="#FFB800" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.scoreValue}>{agentStats.points_cumules}</Text>
                                    <Text style={styles.scoreLabel}>Points cumulés (Score)</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.rankingLink}
                                    onPress={() => router.push('/ranking')}
                                >
                                    <Award size={18} color={PALETTE.clay[500]} />
                                    <Text style={styles.rankingLinkText}>Classement</Text>
                                </TouchableOpacity>
                            </View>
                        </GlassSurface>

                        {/* Exact counters from Swagger request */}
                        <View style={styles.statsGrid}>
                            <GlassSurface style={styles.statCard}>
                                <View style={[styles.statIconCircle, { backgroundColor: PALETTE.status.validatedBg }]}>
                                    <CheckCircle size={22} color={PALETTE.status.validated} />
                                </View>
                                <Text style={styles.statCardValue}>{agentStats.nb_valide}</Text>
                                <Text style={styles.statCardLabel}>nb_valide</Text>
                            </GlassSurface>

                            <GlassSurface style={styles.statCard}>
                                <View style={[styles.statIconCircle, { backgroundColor: PALETTE.status.pendingBg }]}>
                                    <Clock size={22} color={PALETTE.status.pending} />
                                </View>
                                <Text style={styles.statCardValue}>{agentStats.nb_en_attente}</Text>
                                <Text style={styles.statCardLabel}>nb_en_attente</Text>
                            </GlassSurface>

                            <GlassSurface style={styles.statCard}>
                                <View style={[styles.statIconCircle, { backgroundColor: PALETTE.status.rejectedBg }]}>
                                    <XCircle size={22} color={PALETTE.status.rejected} />
                                </View>
                                <Text style={styles.statCardValue}>{agentStats.nb_rejete}</Text>
                                <Text style={styles.statCardLabel}>nb_rejete</Text>
                            </GlassSurface>

                            <GlassSurface style={styles.statCard}>
                                <View style={[styles.statIconCircle, { backgroundColor: PALETTE.clay[500] + '15' }]}>
                                    <MapPin size={22} color={PALETTE.clay[500]} />
                                </View>
                                <Text style={styles.statCardValue}>{agentStats.total_collecte}</Text>
                                <Text style={styles.statCardLabel}>total_collecte</Text>
                            </GlassSurface>
                        </View>

                        {/* Performance bar */}
                        {agentStats.total_collecte > 0 && (
                            <GlassSurface style={styles.progressCard}>
                                <Text style={styles.progressTitle}>Taux de réussite</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                                </View>
                                <View style={styles.progressLabels}>
                                    <Text style={styles.progressPercent}>{progressPercent}% validés</Text>
                                    <Text style={styles.progressDetail}>
                                        {agentStats.nb_valide} / {agentStats.total_collecte}
                                    </Text>
                                </View>
                            </GlassSurface>
                        )}
                    </>
                ) : (
                    <GlassSurface style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Aucune donnée disponible</Text>
                    </GlassSurface>
                )}

                {/* My Points List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mes collectes récentes</Text>

                    {myPoints.length === 0 ? (
                        <GlassSurface style={styles.emptyCard}>
                            <Text style={styles.emptyText}>Commencez à collecter des points pour voir vos activités ici.</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => router.push('/add/location')}
                            >
                                <Text style={styles.addBtnText}>Collecter un point</Text>
                            </TouchableOpacity>
                        </GlassSurface>
                    ) : (
                        myPoints.map((point) => {
                            const status = point.statut_validation || point.statut || 'EN_ATTENTE';
                            return (
                                <TouchableOpacity
                                    key={point.id}
                                    style={styles.pointTile}
                                    onPress={() => router.push(`/point/${point.id}` as any)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.statusStrip, { backgroundColor: statusColor(status) }]} />
                                    <View style={styles.pointTileContent}>
                                        <View style={styles.pointTileTop}>
                                            <Text style={styles.pointTileName} numberOfLines={1}>
                                                {point.nom || 'Commerce sans nom'}
                                            </Text>
                                            <View style={[styles.badge, { backgroundColor: statusColor(status) + '15' }]}>
                                                <Text style={[styles.badgeText, { color: statusColor(status) }]}>
                                                    {statusLabel(status)}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.pointTileMeta}>{point.categorie} • {point.zone || point.adresse}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <FloatingHomeButton />
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
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: PALETTE.glass.white, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.size.xl, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    scrollContent: { padding: SPACING.lg, gap: SPACING.lg },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
    loadingText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },
    scoreCard: { gap: SPACING.md },
    scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.base },
    scoreValue: { fontSize: TYPOGRAPHY.size['3xl'], fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.clay[500] },
    scoreLabel: { fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.secondary },
    rankingLink: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
        backgroundColor: PALETTE.clay[500] + '12', borderRadius: RADIUS.sm,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    },
    rankingLinkText: { fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.semiBold, color: PALETTE.clay[500] },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
    statCard: { width: '47%', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
    statIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    statCardValue: { fontSize: TYPOGRAPHY.size['2xl'], fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary },
    statCardLabel: { fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.tertiary, textTransform: 'lowercase' },
    progressCard: { gap: SPACING.md },
    progressTitle: { fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.semiBold, color: PALETTE.text.primary },
    progressBarBg: { height: 12, borderRadius: 6, backgroundColor: PALETTE.sand[200], overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 6, backgroundColor: PALETTE.status.validated },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    progressPercent: { fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.status.validated },
    progressDetail: { fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary },
    section: { gap: SPACING.md },
    sectionTitle: { fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary },
    pointTile: {
        flexDirection: 'row', backgroundColor: PALETTE.glass.white, borderRadius: RADIUS.sm,
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder, ...SHADOWS.soft, overflow: 'hidden'
    },
    statusStrip: { width: 4 },
    pointTileContent: { flex: 1, padding: SPACING.md, gap: SPACING.xs },
    pointTileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pointTileName: { fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.semiBold, color: PALETTE.text.primary, flex: 1, marginRight: SPACING.sm },
    badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
    badgeText: { fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.bold },
    pointTileMeta: { fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.regular, color: PALETTE.text.tertiary },
    emptyCard: { alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.xl },
    emptyText: { fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.regular, color: PALETTE.text.secondary, textAlign: 'center' },
    addBtn: { backgroundColor: PALETTE.clay[500], borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
    addBtnText: { fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.inverse },
    authGate: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING['2xl'] },
    authGateEmoji: { fontSize: 56, marginBottom: SPACING.lg },
    authGateTitle: { fontSize: TYPOGRAPHY.size.xl, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary, marginBottom: SPACING.sm },
    authGateDesc: { fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.regular, color: PALETTE.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
    authGateBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: PALETTE.clay[500], borderRadius: RADIUS.md, paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.base, ...SHADOWS.medium },
    authGateBtnText: { fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.inverse },
});
