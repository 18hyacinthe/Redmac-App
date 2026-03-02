import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';

interface StepProgressProps {
    currentStep: number;
    totalSteps: number;
    icons: string[];
}

export default function StepProgress({ currentStep, totalSteps, icons }: StepProgressProps) {
    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                    <View style={[
                        styles.step,
                        index < currentStep ? styles.stepCompleted : index === currentStep ? styles.stepActive : styles.stepInactive,
                    ]}>
                        <Text style={[
                            styles.stepIcon,
                            index <= currentStep ? styles.activeIcon : styles.inactiveIcon,
                        ]}>
                            {icons[index] || (index + 1).toString()}
                        </Text>
                    </View>
                    {index < totalSteps - 1 && (
                        <View style={[
                            styles.connector,
                            index < currentStep ? styles.connectorActive : styles.connectorInactive,
                        ]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.base,
        paddingHorizontal: SPACING.lg,
    },
    step: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepActive: {
        backgroundColor: PALETTE.clay[500],
    },
    stepCompleted: {
        backgroundColor: PALETTE.status.validated,
    },
    stepInactive: {
        backgroundColor: PALETTE.sand[300],
    },
    stepIcon: {
        fontSize: 16,
    },
    activeIcon: {
        color: PALETTE.white,
    },
    inactiveIcon: {
        color: PALETTE.text.tertiary,
    },
    connector: {
        flex: 1,
        height: 2,
        marginHorizontal: SPACING.xs,
        borderRadius: 1,
    },
    connectorActive: {
        backgroundColor: PALETTE.status.validated,
    },
    connectorInactive: {
        backgroundColor: PALETTE.sand[300],
    },
});
