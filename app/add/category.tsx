import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import { PointCategory } from '@/types';
import StepProgress from '@/components/StepProgress';
import CategoryTile from '@/components/CategoryTile';
import ActionButton from '@/components/ActionButton';
import { ChevronRight } from 'lucide-react-native';

const STEP_ICONS = ['📍', '🏪', '📸', '✏️', '✅'];
const CATEGORIES: PointCategory[] = ['EPICERIE', 'KIOSQUE', 'CAFE', 'VENDEUR_AMBULANT', 'AUTRE'];

export default function CategoryStep() {
    const router = useRouter();
    const { t } = useLanguage();
    const [selected, setSelected] = useState<PointCategory | null>(null);

    const handleNext = async () => {
        if (!selected) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem('@add_point_category', selected);
        router.push('/add/photo');
    };

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

                <View style={styles.grid}>
                    {CATEGORIES.slice(0, 4).map((cat) => (
                        <CategoryTile
                            key={cat}
                            category={cat}
                            label={t('categories', cat)}
                            selected={selected === cat}
                            onPress={() => setSelected(cat)}
                        />
                    ))}
                </View>

                <CategoryTile
                    category="AUTRE"
                    label={t('categories', 'AUTRE')}
                    selected={selected === 'AUTRE'}
                    onPress={() => setSelected('AUTRE')}
                    fullWidth
                />
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
        color: PALETTE.text.primary, marginBottom: SPACING.xl,
    },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        gap: SPACING.base, marginBottom: SPACING.base,
    },
    footer: { padding: SPACING.lg },
});
