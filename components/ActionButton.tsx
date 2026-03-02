import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PALETTE, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '@/constants/theme';

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'glass';
    style?: ViewStyle;
    disabled?: boolean;
}

export default function ActionButton({
    icon,
    label,
    onPress,
    variant = 'glass',
    style,
    disabled = false,
}: ActionButtonProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 40,
            bounciness: 6,
        }).start();
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const bgStyle = variant === 'primary'
        ? styles.primary
        : variant === 'secondary'
            ? styles.secondary
            : styles.glass;

    const textStyle = variant === 'primary'
        ? styles.primaryText
        : variant === 'secondary'
            ? styles.secondaryText
            : styles.glassText;

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                disabled={disabled}
                style={[styles.button, bgStyle, disabled && styles.disabled]}
            >
                <View style={styles.iconContainer}>{icon}</View>
                <Text style={[styles.label, textStyle]}>{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.xl,
        gap: SPACING.base,
        ...SHADOWS.soft,
    },
    glass: {
        backgroundColor: PALETTE.glass.white,
        borderWidth: 1,
        borderColor: PALETTE.glass.whiteBorder,
    },
    primary: {
        backgroundColor: PALETTE.clay[500],
    },
    secondary: {
        backgroundColor: PALETTE.sand[200],
        borderWidth: 1,
        borderColor: PALETTE.sand[300],
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        flex: 1,
        fontSize: TYPOGRAPHY.size.lg,
        fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    },
    glassText: {
        color: PALETTE.text.primary,
    },
    primaryText: {
        color: PALETTE.text.inverse,
    },
    secondaryText: {
        color: PALETTE.text.primary,
    },
    disabled: {
        opacity: 0.5,
    },
});
