import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { Language, LANGUAGES, translations } from '@/constants/i18n';

interface LanguageContextType {
    language: Language;
    isRTL: boolean;
    setLanguage: (lang: Language) => void;
    t: (section: string, key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = '@cartema_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('fr');
    const [isRTL, setIsRTL] = useState(false);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved && ['ar', 'fr', 'en'].includes(saved)) {
                const lang = saved as Language;
                setLanguageState(lang);
                const langConfig = LANGUAGES.find(l => l.code === lang);
                if (langConfig) {
                    setIsRTL(langConfig.rtl);
                    I18nManager.forceRTL(langConfig.rtl);
                }
            }
        } catch (e) {
            console.log('Error loading language preference:', e);
        }
    };

    const setLanguage = useCallback(async (lang: Language) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, lang);
            setLanguageState(lang);
            const langConfig = LANGUAGES.find(l => l.code === lang);
            if (langConfig) {
                setIsRTL(langConfig.rtl);
                I18nManager.forceRTL(langConfig.rtl);
            }
        } catch (e) {
            console.log('Error saving language preference:', e);
        }
    }, []);

    const t = useCallback((section: string, key: string, params?: Record<string, string | number>): string => {
        try {
            const trans = (translations as any)[section]?.[key]?.[language];
            if (!trans) return key;
            if (!params) return trans;
            return Object.entries(params).reduce(
                (str, [k, v]) => str.replace(`{${k}}`, String(v)),
                trans
            );
        } catch {
            return key;
        }
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, isRTL, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
