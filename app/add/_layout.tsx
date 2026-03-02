import { Stack } from 'expo-router';
import React from 'react';

export default function AddLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: '#F8F5F0' },
            }}
        >
            <Stack.Screen name="location" />
            <Stack.Screen name="category" />
            <Stack.Screen name="photo" />
            <Stack.Screen name="description" />
            <Stack.Screen name="confirm" />
        </Stack>
    );
}
