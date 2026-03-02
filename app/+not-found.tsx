import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Home } from 'lucide-react-native';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Page introuvable</Text>
      <Text style={styles.subtitle}>Cette page n'existe pas.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <Home size={20} color={PALETTE.text.inverse} />
        <Text style={styles.buttonText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.sand[100],
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: PALETTE.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: PALETTE.text.tertiary,
    marginBottom: SPACING['2xl'],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: PALETTE.clay[500],
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.size.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: PALETTE.text.inverse,
  },
});
