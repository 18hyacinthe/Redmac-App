import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IdentityContextType {
    deviceId: string;
    nickname: string | null;
    setNickname: (name: string) => void;
}

const IdentityContext = createContext<IdentityContextType | null>(null);

const DEVICE_ID_KEY = '@cartema_device_id';
const NICKNAME_KEY = '@cartema_nickname';

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function IdentityProvider({ children }: { children: React.ReactNode }) {
    const [deviceId, setDeviceId] = useState<string>('');
    const [nickname, setNicknameState] = useState<string | null>(null);

    useEffect(() => {
        initIdentity();
    }, []);

    const initIdentity = async () => {
        try {
            let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
            if (!id) {
                id = generateUUID();
                await AsyncStorage.setItem(DEVICE_ID_KEY, id);
            }
            setDeviceId(id);

            const savedNickname = await AsyncStorage.getItem(NICKNAME_KEY);
            if (savedNickname) {
                setNicknameState(savedNickname);
            }
        } catch (e) {
            console.log('Error initializing identity:', e);
            setDeviceId(generateUUID());
        }
    };

    const setNickname = useCallback(async (name: string) => {
        try {
            await AsyncStorage.setItem(NICKNAME_KEY, name);
            setNicknameState(name);
        } catch (e) {
            console.log('Error saving nickname:', e);
        }
    }, []);

    return (
        <IdentityContext.Provider value={{ deviceId, nickname, setNickname }}>
            {children}
        </IdentityContext.Provider>
    );
}

export function useIdentity() {
    const context = useContext(IdentityContext);
    if (!context) {
        throw new Error('useIdentity must be used within IdentityProvider');
    }
    return context;
}
