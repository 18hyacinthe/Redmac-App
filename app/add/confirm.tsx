import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, CheckCircle, Camera, FileText, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, SHADOWS, CATEGORY_VISUALS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import { useData } from '@/providers/DataProvider';
import { PointCategory } from '@/types';
import StepProgress from '@/components/StepProgress';
import ActionButton from '@/components/ActionButton';
import GlassSurface from '@/components/GlassSurface';

const STEP_ICONS = ['📍', '🏪', '📸', '✏️', '✅'];

export default function ConfirmStep() {
    const router = useRouter();
    const { t } = useLanguage();
    const { addPoint } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        latitude: 0,
        longitude: 0,
        categorie: '' as PointCategory,
        photo_url: '',
        description: '',
    });

    useEffect(() => {
        loadFormData();
    }, []);

    const loadFormData = async () => {
        try {
            const loc = await AsyncStorage.getItem('@add_point_location');
            const cat = await AsyncStorage.getItem('@add_point_category');
            const photo = await AsyncStorage.getItem('@add_point_photo');
            const desc = await AsyncStorage.getItem('@add_point_description');

            const location = loc ? JSON.parse(loc) : { latitude: 0, longitude: 0 };
            setFormData({
                latitude: location.latitude,
                longitude: location.longitude,
                categorie: (cat || 'EPICERIE') as PointCategory,
                photo_url: photo || '',
                description: desc || '',
            });
        } catch (e) {
            console.error('Error loading form data:', e);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const catLabel = t('categories', formData.categorie);
            const result = await addPoint({
                ...formData,
                nom_affiche: `Point ${catLabel}`,
            });

            setIsSubmitting(false);

            if (result) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // Clear wizard data
                await AsyncStorage.multiRemove([
                    '@add_point_location',
                    '@add_point_category',
                    '@add_point_photo',
                    '@add_point_description',
                ]);

                Alert.alert(
                    t('add', 'success'),
                    t('add', 'successDesc'),
                    [{ text: t('common', 'ok'), onPress: () => router.replace('/') }]
                );
            } else {
                Alert.alert(t('common', 'error'), 'Submission failed');
            }
        } catch (error: any) {
            setIsSubmitting(false);
            if (error?.data?.duplicate) {
                Alert.alert(
                    t('add', 'duplicate'),
                    error.message,
                    [
                        { text: t('add', 'viewDuplicate'), onPress: () => router.push(`/point/${error.data.duplicate.id}` as any) },
                        { text: t('add', 'cancel'), style: 'cancel' },
                    ]
                );
            } else {
                Alert.alert(t('common', 'error'), error?.message || 'Unknown error');
            }
        }
    };

    const categoryVisual = CATEGORY_VISUALS[formData.categorie] || CATEGORY_VISUALS.AUTRE;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.stepLabel}>{t('add', 'stepOf', { current: 5, total: 5 })}</Text>
            </View>

            <StepProgress currentStep={4} totalSteps={5} icons={STEP_ICONS} />

            <View style={styles.content}>
                <Text style={styles.title}>{t('add', 'step5Title')}</Text>

                {/* Summary card */}
                <GlassSurface style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <MapPin size={22} color={PALETTE.status.validated} />
                        <Text style={styles.summaryLabel}>
                            {t('add', 'step5Position')} ✅
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryEmoji}>{categoryVisual.emoji}</Text>
                        <Text style={styles.summaryLabel}>
                            {t('categories', formData.categorie)}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Camera size={22} color={formData.photo_url ? PALETTE.status.validated : PALETTE.text.tertiary} />
                        <Text style={styles.summaryLabel}>
                            {formData.photo_url ? t('add', 'step5Photo') + ' ✅' : t('add', 'step5NoPhoto')}
                        </Text>
                    </View>

                    {formData.description ? (
                        <View style={styles.summaryRow}>
                            <FileText size={22} color={PALETTE.clay[500]} />
                            <Text style={styles.summaryDesc} numberOfLines={2}>
                                "{formData.description}"
                            </Text>
                        </View>
                    ) : null}
                </GlassSurface>

                {/* Info note */}
                <View style={styles.infoBox}>
                    <Info size={18} color={PALETTE.status.pending} />
                    <Text style={styles.infoText}>{t('add', 'info')}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <ActionButton
                    icon={<CheckCircle size={22} color={PALETTE.text.inverse} />}
                    label={isSubmitting ? t('add', 'submitting') : t('add', 'submit')}
                    onPress={handleSubmit}
                    variant="primary"
                    disabled={isSubmitting}
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
        color: PALETTE.text.primary, marginBottom: SPACING.xl,
    },
    summaryCard: {
        marginBottom: SPACING.xl,
    },
    summaryRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: SPACING.md, paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: PALETTE.sand[200],
    },
    summaryEmoji: {
        fontSize: 22,
    },
    summaryLabel: {
        flex: 1, fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.semiBold,
        color: PALETTE.text.primary,
    },
    summaryDesc: {
        flex: 1, fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.secondary, fontStyle: 'italic',
    },
    infoBox: {
        flexDirection: 'row', gap: SPACING.md,
        backgroundColor: PALETTE.status.pendingBg,
        padding: SPACING.base, borderRadius: RADIUS.md,
    },
    infoText: {
        flex: 1, fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.secondary, lineHeight: 20,
    },
    footer: { padding: SPACING.lg },
});
