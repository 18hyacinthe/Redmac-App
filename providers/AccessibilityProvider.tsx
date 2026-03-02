import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilityContextType {
    highContrast: boolean;
    reducedMotion: boolean;
    toggleHighContrast: () => void;
    toggleReducedMotion: () => void;
    animationDuration: (ms: number) => number;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

const HIGH_CONTRAST_KEY = '@cartema_high_contrast';
const REDUCED_MOTION_KEY = '@cartema_reduced_motion';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [highContrast, setHighContrast] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const hc = await AsyncStorage.getItem(HIGH_CONTRAST_KEY);
            const rm = await AsyncStorage.getItem(REDUCED_MOTION_KEY);
            if (hc === 'true') setHighContrast(true);
            if (rm === 'true') setReducedMotion(true);
        } catch (e) {
            console.log('Error loading accessibility preferences:', e);
        }
    };

    const toggleHighContrast = useCallback(async () => {
        const newValue = !highContrast;
        setHighContrast(newValue);
        await AsyncStorage.setItem(HIGH_CONTRAST_KEY, String(newValue));
    }, [highContrast]);

    const toggleReducedMotion = useCallback(async () => {
        const newValue = !reducedMotion;
        setReducedMotion(newValue);
        await AsyncStorage.setItem(REDUCED_MOTION_KEY, String(newValue));
    }, [reducedMotion]);

    const animationDuration = useCallback((ms: number) => {
        return reducedMotion ? 0 : ms;
    }, [reducedMotion]);

    return (
        <AccessibilityContext.Provider value={{
            highContrast,
            reducedMotion,
            toggleHighContrast,
            toggleReducedMotion,
            animationDuration,
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
}
