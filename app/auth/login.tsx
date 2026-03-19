import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Alert, Animated, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Phone, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PALETTE, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import GlassSurface from '@/components/GlassSurface';

type AuthMode = 'otp' | 'email-login' | 'email-register';

export default function LoginScreen() {
    const router = useRouter();
    const { login, loginWithOtp, requestOtp, register } = useAuth();
    const [mode, setMode] = useState<AuthMode>('otp');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // OTP fields
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Email fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 5 }),
        ]).start();
    }, []);

    // Countdown for OTP resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleRequestOtp = async () => {
        if (!phone || phone.length < 10) {
            Alert.alert('Erreur', 'Veuillez entrer un numéro valide (ex: 0612345678)');
            return;
        }
        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await requestOtp(phone);
            setOtpSent(true);
            setCountdown(60);
            Alert.alert('Code envoyé ✅', `Un code OTP a été envoyé au ${phone}`);
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Impossible d\'envoyer le code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) {
            Alert.alert('Erreur', 'Veuillez entrer le code à 6 chiffres');
            return;
        }
        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        try {
            await loginWithOtp(phone, otpCode);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (router.canDismiss()) router.dismissAll();
            router.replace('/profile');
        } catch (error: any) {
            Alert.alert('Code incorrect', error.message || 'Le code OTP est invalide ou expiré');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        try {
            await login(email, password);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (router.canDismiss()) router.dismissAll();
            router.replace('/profile');
        } catch (error: any) {
            Alert.alert('Erreur de connexion', error.message || 'Email ou mot de passe incorrect');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !name) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        try {
            await register({ email, password, name });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (router.canDismiss()) router.dismissAll();
            router.replace('/profile');
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Impossible de créer le compte');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ChevronLeft size={24} color={PALETTE.text.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Title */}
                        <Text style={styles.title}>
                            {mode === 'otp' ? '📱 Connexion par SMS' :
                                mode === 'email-login' ? '📧 Connexion Email' :
                                    '🆕 Créer un compte'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {mode === 'otp'
                                ? 'Recevez un code par SMS pour vous connecter'
                                : mode === 'email-login'
                                    ? 'Connectez-vous avec votre email et mot de passe'
                                    : 'Créez votre compte agent terrain'}
                        </Text>

                        {/* Mode tabs */}
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'otp' && styles.tabActive]}
                                onPress={() => { setMode('otp'); setOtpSent(false); }}
                            >
                                <Phone size={16} color={mode === 'otp' ? PALETTE.text.inverse : PALETTE.text.secondary} />
                                <Text style={[styles.tabText, mode === 'otp' && styles.tabTextActive]}>SMS</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'email-login' && styles.tabActive]}
                                onPress={() => setMode('email-login')}
                            >
                                <Mail size={16} color={mode === 'email-login' ? PALETTE.text.inverse : PALETTE.text.secondary} />
                                <Text style={[styles.tabText, mode === 'email-login' && styles.tabTextActive]}>Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'email-register' && styles.tabActive]}
                                onPress={() => setMode('email-register')}
                            >
                                <User size={16} color={mode === 'email-register' ? PALETTE.text.inverse : PALETTE.text.secondary} />
                                <Text style={[styles.tabText, mode === 'email-register' && styles.tabTextActive]}>Inscription</Text>
                            </TouchableOpacity>
                        </View>

                        {/* OTP Mode */}
                        {mode === 'otp' && (
                            <GlassSurface style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Numéro de téléphone 🇲🇦</Text>
                                    <View style={styles.inputRow}>
                                        <Text style={styles.prefix}>+212</Text>
                                        <TextInput
                                            style={styles.phoneInput}
                                            placeholder="612345678"
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            placeholderTextColor={PALETTE.text.tertiary}
                                            editable={!otpSent}
                                        />
                                    </View>
                                </View>

                                {otpSent && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Code OTP (6 chiffres)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123456"
                                            value={otpCode}
                                            onChangeText={setOtpCode}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            placeholderTextColor={PALETTE.text.tertiary}
                                            autoFocus
                                        />
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                                    onPress={otpSent ? handleVerifyOtp : handleRequestOtp}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={PALETTE.text.inverse} />
                                    ) : (
                                        <Text style={styles.submitText}>
                                            {otpSent ? '✅ Vérifier le code' : '📤 Envoyer le code'}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                {otpSent && countdown > 0 && (
                                    <Text style={styles.countdownText}>
                                        Renvoyer dans {countdown}s
                                    </Text>
                                )}

                                {otpSent && countdown === 0 && (
                                    <TouchableOpacity onPress={handleRequestOtp}>
                                        <Text style={styles.resendText}>Renvoyer le code</Text>
                                    </TouchableOpacity>
                                )}
                            </GlassSurface>
                        )}

                        {/* Email Login Mode */}
                        {mode === 'email-login' && (
                            <GlassSurface style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <View style={styles.inputWithIcon}>
                                        <Mail size={20} color={PALETTE.text.tertiary} />
                                        <TextInput
                                            style={styles.iconInput}
                                            placeholder="agent@geocommercial.ma"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            placeholderTextColor={PALETTE.text.tertiary}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mot de passe</Text>
                                    <View style={styles.inputWithIcon}>
                                        <Lock size={20} color={PALETTE.text.tertiary} />
                                        <TextInput
                                            style={styles.iconInput}
                                            placeholder="••••••••"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            placeholderTextColor={PALETTE.text.tertiary}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword
                                                ? <EyeOff size={20} color={PALETTE.text.tertiary} />
                                                : <Eye size={20} color={PALETTE.text.tertiary} />
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                                    onPress={handleEmailLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={PALETTE.text.inverse} />
                                    ) : (
                                        <Text style={styles.submitText}>Se connecter</Text>
                                    )}
                                </TouchableOpacity>
                            </GlassSurface>
                        )}

                        {/* Register Mode */}
                        {mode === 'email-register' && (
                            <GlassSurface style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nom complet</Text>
                                    <View style={styles.inputWithIcon}>
                                        <User size={20} color={PALETTE.text.tertiary} />
                                        <TextInput
                                            style={styles.iconInput}
                                            placeholder="Agent Terrain"
                                            value={name}
                                            onChangeText={setName}
                                            placeholderTextColor={PALETTE.text.tertiary}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <View style={styles.inputWithIcon}>
                                        <Mail size={20} color={PALETTE.text.tertiary} />
                                        <TextInput
                                            style={styles.iconInput}
                                            placeholder="agent@geocommercial.ma"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            placeholderTextColor={PALETTE.text.tertiary}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mot de passe</Text>
                                    <View style={styles.inputWithIcon}>
                                        <Lock size={20} color={PALETTE.text.tertiary} />
                                        <TextInput
                                            style={styles.iconInput}
                                            placeholder="Min. 6 caractères"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            placeholderTextColor={PALETTE.text.tertiary}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword
                                                ? <EyeOff size={20} color={PALETTE.text.tertiary} />
                                                : <Eye size={20} color={PALETTE.text.tertiary} />
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={PALETTE.text.inverse} />
                                    ) : (
                                        <Text style={styles.submitText}>Créer mon compte</Text>
                                    )}
                                </TouchableOpacity>
                            </GlassSurface>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: PALETTE.sand[100] },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: {
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: PALETTE.glass.white, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg, paddingBottom: SPACING['2xl'],
    },
    title: {
        fontSize: TYPOGRAPHY.size['2xl'], fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.primary, marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.regular,
        color: PALETTE.text.secondary, marginBottom: SPACING.xl, lineHeight: 22,
    },
    tabs: {
        flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: SPACING.xs, paddingVertical: SPACING.md,
        borderRadius: RADIUS.sm, backgroundColor: PALETTE.glass.white,
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    tabActive: {
        backgroundColor: PALETTE.clay[500], borderColor: PALETTE.clay[500],
    },
    tabText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.semiBold,
        color: PALETTE.text.secondary,
    },
    tabTextActive: { color: PALETTE.text.inverse },
    form: { gap: SPACING.lg },
    inputGroup: { gap: SPACING.sm },
    label: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.semiBold,
        color: PALETTE.text.primary,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: PALETTE.sand[50], borderRadius: RADIUS.sm,
        borderWidth: 1, borderColor: PALETTE.sand[300],
    },
    prefix: {
        paddingHorizontal: SPACING.base,
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.semiBold,
        color: PALETTE.clay[500], borderRightWidth: 1, borderRightColor: PALETTE.sand[300],
        paddingVertical: SPACING.base,
    },
    phoneInput: {
        flex: 1, paddingHorizontal: SPACING.base, paddingVertical: SPACING.base,
        fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: PALETTE.text.primary, letterSpacing: 2,
    },
    inputWithIcon: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        backgroundColor: PALETTE.sand[50], borderRadius: RADIUS.sm,
        borderWidth: 1, borderColor: PALETTE.sand[300],
        paddingHorizontal: SPACING.base,
    },
    iconInput: {
        flex: 1, paddingVertical: SPACING.base,
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.medium,
        color: PALETTE.text.primary,
    },
    input: {
        backgroundColor: PALETTE.sand[50], borderRadius: RADIUS.sm,
        borderWidth: 1, borderColor: PALETTE.sand[300],
        paddingHorizontal: SPACING.base, paddingVertical: SPACING.base,
        fontSize: TYPOGRAPHY.size['2xl'], fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.primary, textAlign: 'center', letterSpacing: 12,
    },
    submitBtn: {
        backgroundColor: PALETTE.clay[500], borderRadius: RADIUS.md,
        paddingVertical: SPACING.base + 2, alignItems: 'center',
        marginTop: SPACING.sm,
        ...SHADOWS.medium,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitText: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.bold,
        color: PALETTE.text.inverse,
    },
    countdownText: {
        textAlign: 'center', fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.text.tertiary,
    },
    resendText: {
        textAlign: 'center', fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.semiBold, color: PALETTE.clay[500],
    },
});
