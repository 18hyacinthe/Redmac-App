import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Store } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import { useData } from '@/providers/DataProvider';
import StepProgress from '@/components/StepProgress';
import ActionButton from '@/components/ActionButton';

const STEP_ICONS = ['📍', '🏪', '📸', '✏️', '✅'];

// Emoji mapping for common categories
const CATEGORY_EMOJI: Record<string, string> = {
    'Epicerie': '🏪',
    'Épicerie': '🏪',
    'Boulangerie': '🥖',
    'Café': '☕',
    'Restaurant': '🍽️',
    'Kiosque': '📰',
    'Boucherie': '🥩',
    'Pharmacie': '💊',
    'Poissonnerie': '🐟',
    'Bar': '🍺',
    'Glacier': '🍦',
    'Pâtisserie': '🍰',
    'Charcuterie / Traiteur': '🧆',
    'Primeur / Fruits et Légumes': '🥕',
    'Épicerie Fine': '🧀',
    'Fleuriste': '💐',
    'Supermarché': '🛒',
    'Tabac / Presse': '🚬',
    'Autre': '🏬',
    'Autre Alimentaire': '🍴',
    'Other': '🏬',
};

const CATEGORY_COLORS = [
    '#6B8E4E', '#4A90A4', '#C17B3A', '#8B6B5E',
    '#7A6BAE', '#C65D3B', '#5D8C6A', '#A67B5B',
    '#6B7FA4', '#9B6B85', '#5B8E8E', '#A4826B'
];

export default function CategoryStep() {
    const router = useRouter();
    const { t } = useLanguage();
    const { filters: apiFilters } = useData();
    const [selected, setSelected] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        if (apiFilters?.categories && apiFilters.categories.length > 0) {
            setCategories(apiFilters.categories);
        } else {
            // Fallback categories
            setCategories(['Epicerie', 'Boulangerie', 'Café', 'Kiosque', 'Restaurant', 'Autre']);
        }
    }, [apiFilters]);

    const handleNext = async () => {
        if (!selected) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem('@add_point_category', selected);
        router.push('/add/photo');
    };

    if (categories.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PALETTE.clay[500]} />
                    <Text style={styles.loadingText}>Chargement des catégories...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.stepLabel}>{t('add', 'stepOf', { current: 2, total: 5 })}</Text>
            </View>

            <StepProgress currentStep={1} totalSteps={5} icons={STEP_ICONS} />

            <View style={styles.content}>
                <Text style={styles.title}>{t('add', 'step2Title')}</Text>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                >
                    {categories.map((cat, index) => {
                        const emoji = CATEGORY_EMOJI[cat] || '🏬';
                        const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                        const isSelected = selected === cat;

                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.tile,
                                    isSelected && { borderColor: color, borderWidth: 2.5, backgroundColor: color + '15' },
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelected(cat);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.tileEmoji}>{emoji}</Text>
                                <Text
                                    style={[
                                        styles.tileLabel,
                                        isSelected && { color, fontFamily: TYPOGRAPHY.fontFamily.bold },
                                    ]}
                                    numberOfLines={2}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.footer}>
                <ActionButton
                    icon={<ChevronRight size={22} color={PALETTE.text.inverse} />}
                    label={t('add', 'step2Next')}
                    onPress={handleNext}
                    variant="primary"
                    disabled={!selected}
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
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: PALETTE.glass.white, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    stepLabel: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },
    content: {
        flex: 1, paddingHorizontal: SPACING.lg,
    },
    title: {
        fontSize: TYPOGRAPHY.size['2xl'], fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.primary, marginBottom: SPACING.lg,
    },
    scrollView: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        gap: SPACING.base, paddingBottom: SPACING.xl,
    },
    tile: {
        width: '47%',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: PALETTE.glass.whiteBorder,
        backgroundColor: PALETTE.glass.white,
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 2,
    },
    tileEmoji: {
        fontSize: 36,
    },
    tileLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.semiBold,
        color: PALETTE.text.primary,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md,
    },
    loadingText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },
    footer: { padding: SPACING.lg },
});
