import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, ImageIcon, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import StepProgress from '@/components/StepProgress';
import ActionButton from '@/components/ActionButton';

const STEP_ICONS = ['📍', '🏪', '📸', '✏️', '✅'];

export default function PhotoStep() {
    const router = useRouter();
    const { t } = useLanguage();
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const takePhoto = async () => {
        try {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t('common', 'error'), 'Camera permission required');
                    return;
                }
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true, aspect: [4, 3], quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
                setPhotoUri(result.assets[0].uri);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (e) { console.error('Camera error:', e); }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images' as any, allowsEditing: true, aspect: [4, 3], quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
                setPhotoUri(result.assets[0].uri);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (e) { console.error('Gallery error:', e); }
    };

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem('@add_point_photo', photoUri || '');
        router.push('/add/description');
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('@add_point_photo', '');
        router.push('/add/description');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.stepLabel}>{t('add', 'stepOf', { current: 3, total: 5 })}</Text>
            </View>

            <StepProgress currentStep={2} totalSteps={5} icons={STEP_ICONS} />

            <View style={styles.content}>
                <Text style={styles.title}>{t('add', 'step3Title')}</Text>
                <Text style={styles.subtitle}>{t('add', 'step3Desc')}</Text>

                {/* Photo preview area */}
                <View style={styles.photoArea}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Camera size={56} color={PALETTE.sand[400]} />
                        </View>
                    )}
                </View>

                {/* Photo buttons */}
                <ActionButton
                    icon={<Camera size={22} color={PALETTE.text.inverse} />}
                    label={t('add', 'step3Camera')}
                    onPress={takePhoto}
                    variant="primary"
                    style={{ marginBottom: SPACING.md }}
                />

                <ActionButton
                    icon={<ImageIcon size={22} color={PALETTE.clay[500]} />}
                    label={t('add', 'step3Gallery')}
                    onPress={pickImage}
                    variant="secondary"
                    style={{ marginBottom: SPACING.lg }}
                />

                <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                    <Text style={styles.skipText}>{t('add', 'step3Skip')} →</Text>
                </TouchableOpacity>
            </View>

            {photoUri && (
                <View style={styles.footer}>
                    <ActionButton
                        icon={<ChevronRight size={22} color={PALETTE.text.inverse} />}
                        label={t('add', 'step2Next')}
                        onPress={handleNext}
                        variant="primary"
                    />
                </View>
            )}
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
        color: PALETTE.text.tertiary, marginBottom: SPACING.lg,
    },
    photoArea: {
        height: 260, borderRadius: RADIUS.lg, overflow: 'hidden',
        backgroundColor: PALETTE.sand[200], marginBottom: SPACING.xl,
        ...SHADOWS.soft,
    },
    photoPreview: {
        width: '100%', height: '100%', borderRadius: RADIUS.lg,
    },
    photoPlaceholder: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
    },
    skipBtn: {
        alignItems: 'center', paddingVertical: SPACING.md,
    },
    skipText: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.clay[500],
    },
    footer: { padding: SPACING.lg },
});
