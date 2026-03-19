import React, { useState, useEffect } from 'react';
import {
    StyleSheet, View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trophy, Medal, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PALETTE, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { RankingAgent } from '@/types';
import api from '@/services/api';
import GlassSurface from '@/components/GlassSurface';
import FloatingHomeButton from '@/components/FloatingHomeButton';

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_COLORS = ['#FFB800', '#C0C0C0', '#CD7F32'];

export default function RankingScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [agents, setAgents] = useState<RankingAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { loadRanking(); }, []);

    const loadRanking = async () => {
        try {
            setIsLoading(true);
            const data = await api.getRanking();
            setAgents(data);
        } catch (error) {
            console.error('Error loading ranking:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRanking();
        setRefreshing(false);
    };

    const isCurrentUser = (agent: RankingAgent) => {
        return user?.phone === agent.phone_number || user?.email === agent.email;
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PALETTE.clay[500]} />
                    <Text style={styles.loadingText}>Chargement du classement...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const topThree = agents.slice(0, 3);
    const rest = agents.slice(3);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🏆 Classement</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PALETTE.clay[500]} />}
            >
                {/* Podium */}
                {topThree.length > 0 && (
                    <View style={styles.podium}>
                        {topThree.map((agent, idx) => (
                            <View
                                key={agent.id}
                                style={[
                                    styles.podiumItem,
                                    idx === 0 && styles.podiumFirst,
                                    isCurrentUser(agent) && styles.podiumCurrent,
                                ]}
                            >
                                <Text style={styles.podiumMedal}>{MEDALS[idx]}</Text>
                                <View style={[styles.podiumAvatar, { borderColor: PODIUM_COLORS[idx] }]}>
                                    <Text style={styles.podiumAvatarText}>
                                        {agent.phone_number?.slice(-2) || '??'}
                                    </Text>
                                </View>
                                <Text style={styles.podiumPhone} numberOfLines={1}>
                                    {agent.phone_number
                                        ? `***${agent.phone_number.slice(-4)}`
                                        : agent.email?.split('@')[0] || 'Agent'}
                                </Text>
                                <Text style={[styles.podiumScore, { color: PODIUM_COLORS[idx] }]}>
                                    {agent.points_sent} pts
                                </Text>
                                <Text style={styles.podiumValidated}>
                                    ✅ {agent.nb_validated}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Rest of entries */}
                {rest.length > 0 && (
                    <GlassSurface style={styles.listCard}>
                        {rest.map((agent, idx) => (
                            <View
                                key={agent.id}
                                style={[
                                    styles.listItem,
                                    isCurrentUser(agent) && styles.listItemCurrent,
                                    idx < rest.length - 1 && styles.listItemBorder,
                                ]}
                            >
                                <Text style={styles.listRank}>#{idx + 4}</Text>
                                <View style={styles.listInfo}>
                                    <Text style={styles.listPhone} numberOfLines={1}>
                                        {agent.phone_number
                                            ? `***${agent.phone_number.slice(-4)}`
                                            : agent.email?.split('@')[0] || 'Agent'}
                                    </Text>
                                    <Text style={styles.listMeta}>
                                        ✅ {agent.nb_validated} validés
                                    </Text>
                                </View>
                                <Text style={styles.listScore}>{agent.points_sent} pts</Text>
                            </View>
                        ))}
                    </GlassSurface>
                )}

                {agents.length === 0 && (
                    <GlassSurface style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>🏆</Text>
                        <Text style={styles.emptyText}>
                            Aucun agent classé pour le moment. Soyez le premier !
                        </Text>
                    </GlassSurface>
                )}

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
    scrollContent: { padding: SPACING.lg, gap: SPACING.xl },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
    loadingText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },

    // Podium
    podium: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: SPACING.md,
    },
    podiumItem: {
        alignItems: 'center', gap: SPACING.xs,
        backgroundColor: PALETTE.glass.white, borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.lg,
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
        flex: 1,
        ...SHADOWS.soft,
    },
    podiumFirst: {
        paddingVertical: SPACING.xl,
        marginBottom: -SPACING.md,
    },
    podiumCurrent: {
        borderColor: PALETTE.clay[500], borderWidth: 2,
        backgroundColor: PALETTE.clay[500] + '08',
    },
    podiumMedal: { fontSize: 28 },
    podiumAvatar: {
        width: 44, height: 44, borderRadius: 22,
        borderWidth: 3, alignItems: 'center', justifyContent: 'center',
        backgroundColor: PALETTE.sand[200],
    },
    podiumAvatarText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    podiumPhone: {
        fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.semiBold, color: PALETTE.text.primary,
    },
    podiumScore: {
        fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold,
    },
    podiumValidated: {
        fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },

    // List
    listCard: { gap: 0 },
    listItem: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        paddingVertical: SPACING.md,
    },
    listItemCurrent: {
        backgroundColor: PALETTE.clay[500] + '08',
        marginHorizontal: -SPACING.base,
        paddingHorizontal: SPACING.base,
        borderRadius: RADIUS.sm,
    },
    listItemBorder: {
        borderBottomWidth: 1, borderBottomColor: PALETTE.sand[200],
    },
    listRank: {
        width: 36, fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.tertiary, textAlign: 'center',
    },
    listInfo: { flex: 1 },
    listPhone: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.semiBold, color: PALETTE.text.primary,
    },
    listMeta: {
        fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.regular, color: PALETTE.text.tertiary,
    },
    listScore: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.clay[500],
    },

    // Empty
    emptyCard: { alignItems: 'center', gap: SPACING.md },
    emptyEmoji: { fontSize: 48 },
    emptyText: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.secondary, textAlign: 'center',
    },
});
