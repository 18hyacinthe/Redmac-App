import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Camera, CheckCircle, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import { useData } from '@/providers/DataProvider';
import GlassSurface from '@/components/GlassSurface';
import StatBar from '@/components/StatBar';
import FloatingHomeButton from '@/components/FloatingHomeButton';

export default function StatsScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const { getStats } = useData();
    const stats = getStats();

    const maxCityValue = Math.max(...Object.values(stats.parVille), 1);
    const sortedCities = Object.entries(stats.parVille)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('stats', 'title')}</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats cards */}
                <GlassSurface style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statEmoji}>📊</Text>
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>{t('stats', 'total')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statEmoji}>✅</Text>
                            <Text style={[styles.statValue, { color: PALETTE.status.validated }]}>{stats.valides}</Text>
                            <Text style={styles.statLabel}>{t('stats', 'validated')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statEmoji}>⏳</Text>
                            <Text style={[styles.statValue, { color: PALETTE.status.pending }]}>{stats.enAttente}</Text>
                            <Text style={styles.statLabel}>{t('stats', 'pending')}</Text>
                        </View>
                    </View>
                </GlassSurface>

                {/* By city */}
                {sortedCities.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('stats', 'byCity')}</Text>
                        <GlassSurface>
                            {sortedCities.map(([city, count]) => (
                                <StatBar
                                    key={city}
                                    label={city}
                                    value={count}
                                    maxValue={maxCityValue}
                                    color={PALETTE.clay[500]}
                                />
                            ))}
                        </GlassSurface>
                    </View>
                )}

                {/* How it works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('stats', 'howItWorks')}</Text>
                    <GlassSurface>
                        <View style={styles.howStep}>
                            <View style={[styles.howIcon, { backgroundColor: PALETTE.status.validatedBg }]}>
                                <MapPin size={24} color={PALETTE.status.validated} />
                            </View>
                            <View style={styles.howContent}>
                                <Text style={styles.howNumber}>1</Text>
                                <Text style={styles.howText}>{t('stats', 'howStep1')}</Text>
                            </View>
                        </View>

                        <View style={styles.howStep}>
                            <View style={[styles.howIcon, { backgroundColor: PALETTE.status.pendingBg }]}>
                                <Camera size={24} color={PALETTE.status.pending} />
                            </View>
                            <View style={styles.howContent}>
                                <Text style={styles.howNumber}>2</Text>
                                <Text style={styles.howText}>{t('stats', 'howStep2')}</Text>
                            </View>
                        </View>

                        <View style={styles.howStep}>
                            <View style={[styles.howIcon, { backgroundColor: 'rgba(198, 93, 59, 0.1)' }]}>
                                <CheckCircle size={24} color={PALETTE.clay[500]} />
                            </View>
                            <View style={styles.howContent}>
                                <Text style={styles.howNumber}>3</Text>
                                <Text style={styles.howText}>{t('stats', 'howStep3')}</Text>
                            </View>
                        </View>
                    </GlassSurface>
                </View>

                {/* Trust section */}
                <View style={styles.section}>
                    <GlassSurface>
                        <View style={styles.trustRow}>
                            <Text style={styles.trustFlag}>🇲🇦</Text>
                            <Text style={styles.trustTitle}>{t('home', 'trustSeal')}</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <Shield size={16} color={PALETTE.status.validated} />
                            <Text style={styles.trustText}>{t('stats', 'openData')}</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <Shield size={16} color={PALETTE.status.validated} />
                            <Text style={styles.trustText}>{t('stats', 'noAccount')}</Text>
                        </View>
                        <View style={styles.trustItem}>
                            <Shield size={16} color={PALETTE.status.validated} />
                            <Text style={styles.trustText}>{t('stats', 'privacy')}</Text>
                        </View>
                    </GlassSurface>
                </View>

                {/* Spacer for floating button */}
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
    scrollView: { flex: 1 },
    scrollContent: { padding: SPACING.lg, gap: SPACING.lg },
    statsGrid: { marginBottom: 0 },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    },
    statItem: { alignItems: 'center', flex: 1, gap: SPACING.xs },
    statEmoji: { fontSize: 24 },
    statValue: {
        fontSize: TYPOGRAPHY.size['4xl'], fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },
    statDivider: {
        width: 1, height: 60, backgroundColor: PALETTE.sand[300],
    },
    section: { gap: SPACING.md },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    howStep: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.base,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: PALETTE.sand[200],
    },
    howIcon: {
        width: 48, height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
    },
    howContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    howNumber: {
        fontSize: TYPOGRAPHY.size.xl, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.clay[500],
    },
    howText: {
        flex: 1, fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.primary,
    },
    trustRow: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        marginBottom: SPACING.base, paddingBottom: SPACING.base,
        borderBottomWidth: 1, borderBottomColor: PALETTE.sand[200],
    },
    trustFlag: { fontSize: 24 },
    trustTitle: {
        fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    trustItem: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        paddingVertical: SPACING.sm,
    },
    trustText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.secondary,
    },
});
