import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ShoppingBag, Newspaper, Coffee, ShoppingCart, Store } from 'lucide-react-native';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, CATEGORY_VISUALS } from '@/constants/theme';
import { PointCategory } from '@/types';

interface CategoryTileProps {
    category: PointCategory;
    label: string;
    selected: boolean;
    onPress: () => void;
    fullWidth?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
    ShoppingBag,
    Newspaper,
    Coffee,
    ShoppingCart,
    Store,
};

export default function CategoryTile({
    category,
    label,
    selected,
    onPress,
    fullWidth = false,
}: CategoryTileProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const visual = CATEGORY_VISUALS[category];
    const IconComponent = ICON_MAP[visual.icon];

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
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

    return (
        <Animated.View style={[
            { transform: [{ scale: scaleAnim }] },
            fullWidth ? styles.fullWidth : styles.halfWidth,
        ]}>
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                style={[
                    styles.tile,
                    { backgroundColor: selected ? visual.bgColor : PALETTE.glass.white },
                    selected && { borderColor: visual.color, borderWidth: 2.5 },
                ]}
            >
                <View style={[styles.iconCircle, { backgroundColor: visual.bgColor }]}>
                    {IconComponent && (
                        <IconComponent size={32} color={visual.color} />
                    )}
                </View>
                <Text style={[
                    styles.label,
                    selected && { color: visual.color, fontFamily: TYPOGRAPHY.fontFamily.bold },
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    halfWidth: {
        width: '48%',
    },
    fullWidth: {
        width: '100%',
    },
    tile: {
        height: 130,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
        borderWidth: 1,
        borderColor: PALETTE.glass.whiteBorder,
        shadowColor: 'rgba(0,0,0,0.06)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 2,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.semiBold,
        color: PALETTE.text.primary,
        textAlign: 'center',
    },
});
