import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Modal, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Globe } from 'lucide-react-native';
import { PALETTE, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import { LANGUAGES, Language } from '@/constants/i18n';
import { useLanguage } from '@/providers/LanguageProvider';
import GlassSurface from './GlassSurface';

export default function LanguageSwitch() {
    const { language, setLanguage } = useLanguage();
    const [visible, setVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const openDropdown = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const closeDropdown = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    const selectLanguage = (lang: Language) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLanguage(lang);
        closeDropdown();
    };

    const currentLang = LANGUAGES.find(l => l.code === language);

    return (
        <>
            <TouchableOpacity
                style={styles.trigger}
                onPress={openDropdown}
                accessibilityLabel="Change language"
                accessibilityHint="Opens language selection"
            >
                <Globe size={22} color={PALETTE.text.secondary} />
                <Text style={styles.triggerFlag}>{currentLang?.flag}</Text>
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={closeDropdown}
            >
                <Pressable style={styles.backdrop} onPress={closeDropdown}>
                    <Animated.View style={[styles.dropdown, { opacity: fadeAnim }]}>
                        <GlassSurface style={styles.dropdownGlass}>
                            {LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[
                                        styles.option,
                                        language === lang.code && styles.optionActive,
                                    ]}
                                    onPress={() => selectLanguage(lang.code)}
                                >
                                    <Text style={styles.optionFlag}>{lang.flag}</Text>
                                    <Text style={[
                                        styles.optionLabel,
                                        language === lang.code && styles.optionLabelActive,
                                    ]}>
                                        {lang.label}
                                    </Text>
                                    {language === lang.code && (
                                        <View style={styles.checkDot} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </GlassSurface>
                    </Animated.View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        padding: SPACING.sm,
        borderRadius: RADIUS.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    triggerFlag: {
        fontSize: 16,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'flex-start',
        paddingTop: 100,
        paddingHorizontal: SPACING.lg,
    },
    dropdown: {
        maxWidth: 220,
    },
    dropdownGlass: {
        borderRadius: RADIUS.md,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.base,
        paddingHorizontal: SPACING.base,
        borderRadius: RADIUS.sm,
        minHeight: 56,
    },
    optionActive: {
        backgroundColor: 'rgba(198, 93, 59, 0.08)',
    },
    optionFlag: {
        fontSize: 24,
    },
    optionLabel: {
        flex: 1,
        fontSize: TYPOGRAPHY.size.base,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: PALETTE.text.primary,
    },
    optionLabelActive: {
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.clay[500],
    },
    checkDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: PALETTE.clay[500],
    },
});
