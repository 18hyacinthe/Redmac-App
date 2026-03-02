import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Mic } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import StepProgress from '@/components/StepProgress';
import ActionButton from '@/components/ActionButton';

const STEP_ICONS = ['📍', '🏪', '📸', '✏️', '✅'];

export default function DescriptionStep() {
    const router = useRouter();
    const { t } = useLanguage();
    const [description, setDescription] = useState('');

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem('@add_point_description', description);
        router.push('/add/confirm');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.stepLabel}>{t('add', 'stepOf', { current: 4, total: 5 })}</Text>
            </View>

            <StepProgress currentStep={3} totalSteps={5} icons={STEP_ICONS} />

            <View style={styles.content}>
                <Text style={styles.title}>{t('add', 'step4Title')}</Text>
                <Text style={styles.subtitle}>({t('add', 'step4Optional')})</Text>

                <TextInput
                    style={styles.textArea}
                    placeholder={t('add', 'step4Placeholder')}
                    value={description}
                    onChangeText={(text) => {
                        if (text.length <= 200) setDescription(text);
                    }}
                    multiline
                    numberOfLines={5}
                    maxLength={200}
                    placeholderTextColor={PALETTE.text.tertiary}
                    textAlignVertical="top"
                />

                <View style={styles.charRow}>
                    <Text style={styles.charCount}>{description.length}/200</Text>
                </View>

                {/* Voice input button */}
                <TouchableOpacity style={styles.voiceBtn}>
                    <Mic size={22} color={PALETTE.clay[500]} />
                    <Text style={styles.voiceText}>{t('add', 'step4Voice')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <ActionButton
                    icon={<ChevronRight size={22} color={PALETTE.text.inverse} />}
                    label={t('add', 'step2Next')}
                    onPress={handleNext}
                    variant="primary"
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
    content: { flex: 1, paddingHorizontal: SPACING.lg },
    title: {
        fontSize: TYPOGRAPHY.size['2xl'], fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.primary, marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.tertiary, marginBottom: SPACING.xl,
    },
    textArea: {
        backgroundColor: PALETTE.glass.white,
        borderRadius: RADIUS.md,
        padding: SPACING.base,
        fontSize: TYPOGRAPHY.size.base,
        fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.primary,
        minHeight: 140,
        borderWidth: 1,
        borderColor: PALETTE.glass.whiteBorder,
        ...SHADOWS.soft,
    },
    charRow: {
        alignItems: 'flex-end',
        marginTop: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    charCount: {
        fontSize: TYPOGRAPHY.size.xs,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: PALETTE.text.tertiary,
    },
    voiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: PALETTE.glass.white,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.base,
        borderWidth: 1,
        borderColor: PALETTE.clay[500],
    },
    voiceText: {
        fontSize: TYPOGRAPHY.size.base,
        fontFamily: TYPOGRAPHY.fontFamily.semiBold,
        color: PALETTE.clay[500],
    },
    footer: { padding: SPACING.lg },
});
