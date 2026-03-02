import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { PALETTE, RADIUS, SHADOWS } from '@/constants/theme';

interface GlassSurfaceProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    variant?: 'light' | 'dark';
    noPadding?: boolean;
}

export default function GlassSurface({
    children,
    style,
    intensity = 40,
    variant = 'light',
    noPadding = false,
}: GlassSurfaceProps) {
    const isLight = variant === 'light';

    return (
        <View style={[
            styles.container,
            isLight ? styles.lightShadow : styles.darkShadow,
            style,
        ]}>
            <BlurView
                intensity={intensity}
                tint={isLight ? 'light' : 'dark'}
                style={[
                    styles.blur,
                    isLight ? styles.lightOverlay : styles.darkOverlay,
                    !noPadding && styles.padding,
                ]}
            >
                {children}
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    blur: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    padding: {
        padding: 20,
    },
    lightOverlay: {
        backgroundColor: PALETTE.glass.white,
        borderWidth: 1,
        borderColor: PALETTE.glass.whiteBorder,
    },
    darkOverlay: {
        backgroundColor: PALETTE.glass.dark,
        borderWidth: 1,
        borderColor: PALETTE.glass.darkBorder,
    },
    lightShadow: {
        ...SHADOWS.soft,
    },
    darkShadow: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 5,
    },
});
