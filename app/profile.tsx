import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft, MapPin, Trophy, Star, Clock,
    CheckCircle, XCircle, AlertCircle, LogOut, Award,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PALETTE, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { AgentStats, PointDeVente } from '@/types';
import api from '@/services/api';
import GlassSurface from '@/components/GlassSurface';
import FloatingHomeButton from '@/components/FloatingHomeButton';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();
    const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
    const [myPoints, setMyPoints] = useState<PointDeVente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (isAuthenticated) loadData();
        else setIsLoading(false);
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await api.getMyPoints({ limit: 50 });
            setAgentStats(res.agent);
            setMyPoints(res.data || []);
        } catch (error) {
            console.error('Error loading my points:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft size={24} color={PALETTE.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mon Profil</Text>
                    <View style={{ width: 48 }} />
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🔐</Text>
                    <Text style={styles.emptyTitle}>Connectez-vous</Text>
                    <Text style={styles.emptyDesc}>
                        Connectez-vous pour voir votre tableau de bord, vos points collectés et votre classement
                    </Text>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={styles.loginBtnText}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
                <FloatingHomeButton />
            </SafeAreaView>
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PALETTE.clay[500]} />
                </View>
            </SafeAreaView>
        );
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case 'VALIDE': return <CheckCircle size={16} color={PALETTE.status.validated} />;
            case 'REJETE': return <XCircle size={16} color={PALETTE.status.rejected} />;
            default: return <AlertCircle size={16} color={PALETTE.status.pending} />;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={20} color={PALETTE.status.rejected} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PALETTE.clay[500]} />}
            >
                {/* Agent identity */}
                <GlassSurface style={styles.profileCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarEmoji}>👤</Text>
                    </View>
                    <Text style={styles.profilePhone}>
                        {user?.phone || user?.email || 'Agent'}
                    </Text>
                    <Text style={styles.profileRole}>
                        {user?.role === 'admin' ? '🛡️ Administrateur' : '📱 Agent Terrain'}
                    </Text>
                </GlassSurface>

                {/* Points score */}
                {agentStats && (
                    <GlassSurface style={styles.scoreCard}>
                        <View style={styles.scoreHeader}>
                            <Trophy size={28} color="#FFB800" />
                            <View>
                                <Text style={styles.scoreValue}>{agentStats.points_cumules}</Text>
                                <Text style={styles.scoreLabel}>Points cumulés</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <View style={[styles.statDot, { backgroundColor: PALETTE.status.validated }]} />
                                <Text style={styles.statNumber}>{agentStats.nb_valide}</Text>
                                <Text style={styles.statLabel}>Validés</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <View style={[styles.statDot, { backgroundColor: PALETTE.status.pending }]} />
                                <Text style={styles.statNumber}>{agentStats.nb_en_attente}</Text>
                                <Text style={styles.statLabel}>En attente</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <View style={[styles.statDot, { backgroundColor: PALETTE.status.rejected }]} />
                                <Text style={styles.statNumber}>{agentStats.nb_rejete}</Text>
                                <Text style={styles.statLabel}>Rejetés</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <View style={[styles.statDot, { backgroundColor: PALETTE.clay[500] }]} />
                                <Text style={styles.statNumber}>{agentStats.total_collecte}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                        </View>
                    </GlassSurface>
                )}

                {/* Ranking button */}
                <TouchableOpacity
                    style={styles.rankingBtn}
                    onPress={() => router.push('/ranking')}
                >
                    <Award size={22} color={PALETTE.clay[500]} />
                    <Text style={styles.rankingBtnText}>Voir le classement des agents</Text>
                    <ChevronLeft size={18} color={PALETTE.text.tertiary} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                {/* My collected points */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Mes points collectés ({myPoints.length})
                    </Text>

                    {myPoints.length === 0 ? (
                        <GlassSurface style={styles.emptyPointsCard}>
                            <Text style={styles.emptyPointsEmoji}>📍</Text>
                            <Text style={styles.emptyPointsText}>
                                Aucun point collecté. Commencez à ajouter des points de vente !
                            </Text>
                        </GlassSurface>
                    ) : (
                        myPoints.map((point) => (
                            <TouchableOpacity
                                key={point.id}
                                style={styles.pointCard}
                                onPress={() => router.push(`/point/${point.id}` as any)}
                            >
                                <View style={styles.pointLeft}>
                                    {statusIcon(point.statut_validation || 'EN_ATTENTE')}
                                    <View style={styles.pointInfo}>
                                        <Text style={styles.pointName} numberOfLines={1}>
                                            {point.nom || 'Sans nom'}
                                        </Text>
                                        <Text style={styles.pointMeta} numberOfLines={1}>
                                            {point.categorie} • {point.zone || point.adresse}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.pointDate}>
                                    {new Date(point.date_collecte).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={{ height: 80 }} />
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
    logoutBtn: {
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: PALETTE.status.rejectedBg, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    scrollContent: { padding: SPACING.lg, gap: SPACING.lg },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Profile card
    profileCard: { alignItems: 'center', gap: SPACING.sm },
    avatarCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: PALETTE.clay[500] + '15', alignItems: 'center', justifyContent: 'center',
    },
    avatarEmoji: { fontSize: 36 },
    profilePhone: {
        fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    profileRole: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.secondary,
    },

    // Score card
    scoreCard: { gap: SPACING.lg },
    scoreHeader: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.base,
    },
    scoreValue: {
        fontSize: TYPOGRAPHY.size['3xl'], fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.clay[500],
    },
    scoreLabel: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.secondary,
    },
    statsRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    },
    statItem: { alignItems: 'center', gap: SPACING.xs },
    statDot: { width: 10, height: 10, borderRadius: 5 },
    statNumber: {
        fontSize: TYPOGRAPHY.size.xl, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },
    statDivider: { width: 1, height: 40, backgroundColor: PALETTE.sand[300] },

    // Ranking button
    rankingBtn: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        backgroundColor: PALETTE.glass.white, borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.base,
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
        ...SHADOWS.soft,
    },
    rankingBtnText: {
        flex: 1, fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.semiBold,
        color: PALETTE.text.primary,
    },

    // Section
    section: { gap: SPACING.md },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },

    // Point card
    pointCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: PALETTE.glass.white, borderRadius: RADIUS.sm,
        paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    pointLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
    pointInfo: { flex: 1 },
    pointName: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.semiBold, color: PALETTE.text.primary,
    },
    pointMeta: {
        fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.regular, color: PALETTE.text.tertiary,
    },
    pointDate: {
        fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },

    // Empty states
    emptyState: {
        flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING['2xl'],
    },
    emptyEmoji: { fontSize: 56, marginBottom: SPACING.lg },
    emptyTitle: {
        fontSize: TYPOGRAPHY.size.xl, fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.primary, marginBottom: SPACING.sm,
    },
    emptyDesc: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl,
    },
    loginBtn: {
        backgroundColor: PALETTE.clay[500], borderRadius: RADIUS.md,
        paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.base,
        ...SHADOWS.medium,
    },
    loginBtnText: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.inverse,
    },
    emptyPointsCard: { alignItems: 'center', gap: SPACING.md },
    emptyPointsEmoji: { fontSize: 36 },
    emptyPointsText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.secondary, textAlign: 'center', lineHeight: 20,
    },
});
