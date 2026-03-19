import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Image, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Map, Plus, BarChart3, User, LogIn } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PALETTE, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import ActionButton from '@/components/ActionButton';
import LanguageSwitch from '@/components/LanguageSwitch';
import GlassSurface from '@/components/GlassSurface';
import { useAuth } from '@/providers/AuthProvider';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Blurred map background */}
      <View style={styles.mapBackground}>
        <Image
          source={{ uri: 'https://tile.openstreetmap.org/5/16/12.png' }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <BlurView intensity={60} tint="light" style={styles.mapBlur} />
        <View style={styles.mapOverlay} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <LanguageSwitch />
          <Text style={styles.appName}>{t('home', 'appName')}</Text>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push(isAuthenticated ? '/profile' : '/auth/login')}
          >
            {isAuthenticated
              ? <User size={22} color={PALETTE.clay[500]} />
              : <LogIn size={22} color={PALETTE.text.secondary} />
            }
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}>
          <GlassSurface style={styles.glassPanel}>
            <View style={styles.buttonsContainer}>
              <ActionButton
                icon={<Map size={26} color={PALETTE.status.validated} />}
                label={t('home', 'viewMap')}
                onPress={() => router.push('/map')}
                variant="glass"
              />

              <ActionButton
                icon={<Plus size={26} color={PALETTE.text.inverse} />}
                label={t('home', 'addPoint')}
                onPress={() => {
                  if (!isAuthenticated) {
                    Alert.alert(
                      '🔐 Connexion requise',
                      'Vous devez être connecté pour ajouter un point de vente.',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Se connecter', onPress: () => router.push('/auth/login') },
                      ]
                    );
                    return;
                  }
                  router.push('/add/location');
                }}
                variant="primary"
              />

              <ActionButton
                icon={<BarChart3 size={26} color={PALETTE.clay[400]} />}
                label={isAuthenticated ? 'Mon Dashboard' : t('home', 'explore')}
                onPress={() => {
                  if (!isAuthenticated) {
                    Alert.alert(
                      '🔐 Connexion requise',
                      'Connectez-vous pour accéder aux statistiques.',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Se connecter', onPress: () => router.push('/auth/login') },
                      ]
                    );
                    return;
                  }
                  router.push('/stats');
                }}
                variant="glass"
              />

              <ActionButton
                icon={isAuthenticated
                  ? <User size={26} color={PALETTE.clay[400]} />
                  : <LogIn size={26} color={PALETTE.clay[400]} />
                }
                label={isAuthenticated ? 'Mon Profil' : 'Se connecter'}
                onPress={() => router.push(isAuthenticated ? '/profile' : '/auth/login')}
                variant="glass"
              />
            </View>
          </GlassSurface>
        </Animated.View>

        {/* Trust footer */}
        <View style={styles.footer}>
          <View style={styles.trustSeal}>
            <Text style={styles.trustFlag}>🇲🇦</Text>
            <Text style={styles.trustText}>{t('home', 'trustSeal')}</Text>
          </View>
          <Text style={styles.trustSubtext}>{t('home', 'trustSubtext')}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.sand[100],
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  mapBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 245, 240, 0.6)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  appName: {
    fontSize: TYPOGRAPHY.size.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: PALETTE.text.primary,
    letterSpacing: 0.5,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALETTE.glass.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PALETTE.glass.whiteBorder,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  glassPanel: {
    borderRadius: RADIUS.xl,
  },
  buttonsContainer: {
    gap: SPACING.base,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  trustSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  trustFlag: {
    fontSize: 18,
  },
  trustText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: PALETTE.text.secondary,
  },
  trustSubtext: {
    fontSize: TYPOGRAPHY.size.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: PALETTE.text.tertiary,
    letterSpacing: 1,
  },
});
