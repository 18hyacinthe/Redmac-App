import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING } from '@/constants/theme';

interface StatBarProps {
    label: string;
    value: number;
    maxValue: number;
    color?: string;
}

export default function StatBar({
    label,
    value,
    maxValue,
    color = PALETTE.clay[500],
}: StatBarProps) {
    const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
            <View style={styles.track}>
                <View
                    style={[
                        styles.fill,
                        { width: `${percentage}%`, backgroundColor: color },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.base,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    label: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: PALETTE.text.secondary,
    },
    value: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.primary,
    },
    track: {
        height: 8,
        backgroundColor: PALETTE.sand[200],
        borderRadius: RADIUS.full,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: RADIUS.full,
    },
});
