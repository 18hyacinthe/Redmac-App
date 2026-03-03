import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PALETTE, TYPOGRAPHY, RADIUS, SPACING, SHADOWS, CATEGORY_VISUALS } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';
import { useData } from '@/providers/DataProvider';
import GlassSurface from '@/components/GlassSurface';

export default function PointDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { points } = useData();
  const point = points.find(p => String(p.id) === String(id));

  if (!point) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={PALETTE.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PALETTE.clay[500]} />
        </View>
      </SafeAreaView>
    );
  }

  const categoryVisual = (CATEGORY_VISUALS as any)[point.categorie] || CATEGORY_VISUALS.AUTRE;
  const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    VALIDE: {
      bg: PALETTE.status.validatedBg,
      text: PALETTE.status.validated,
      icon: <CheckCircle size={18} color={PALETTE.status.validated} />,
    },
    EN_ATTENTE: {
      bg: PALETTE.status.pendingBg,
      text: PALETTE.status.pending,
      icon: <AlertCircle size={18} color={PALETTE.status.pending} />,
    },
    REJETE: {
      bg: PALETTE.status.rejectedBg,
      text: PALETTE.status.rejected,
      icon: <XCircle size={18} color={PALETTE.status.rejected} />,
    },
  };

  const status = statusColors[point.statut || 'EN_ATTENTE'] || statusColors.EN_ATTENTE;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Drag handle */}
      <View style={styles.dragHandle} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={PALETTE.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title + status */}
        <View style={styles.titleRow}>
          <Text style={styles.pointName}>
            {point.nom_affiche || point.nom || t('point', 'noName')}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            {status.icon}
            <Text style={[styles.statusText, { color: status.text }]}>
              {t('statuses', point.statut || 'EN_ATTENTE')}
            </Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.categoryRow}>
          <Text style={styles.categoryEmoji}>{categoryVisual.emoji}</Text>
          <Text style={[styles.categoryLabel, { color: categoryVisual.color }]}>
            {t('categories', point.categorie)}
          </Text>
        </View>

        {/* Photo */}
        {point.image_url ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: point.image_url }} style={styles.photo} />
          </View>
        ) : null}

        {/* Details card */}
        <GlassSurface style={styles.detailsCard}>
          {(point.zone || point.ville || point.adresse || point.quartier) && (
            <View style={styles.detailRow}>
              <MapPin size={20} color={PALETTE.clay[500]} />
              <Text style={styles.detailText}>
                {[point.zone || point.ville, point.adresse || point.quartier].filter(Boolean).join(' — ')}
              </Text>
            </View>
          )}

          {point.type && (
            <View style={styles.detailRow}>
              <Clock size={20} color={PALETTE.clay[500]} />
              <Text style={styles.detailText}>Type: {point.type}</Text>
            </View>
          )}

          {point.description && (
            <View style={styles.detailRow}>
              <FileText size={20} color={PALETTE.clay[500]} />
              <Text style={styles.detailText}>{point.description}</Text>
            </View>
          )}

          {point.source && (
            <View style={styles.detailRow}>
              <MapPin size={20} color={PALETTE.text.tertiary} />
              <Text style={[styles.detailText, { fontStyle: 'italic' }]}>
                Source: {point.source}
              </Text>
            </View>
          )}
        </GlassSurface>

        {/* Date info */}
        <Text style={styles.dateText}>
          {new Date(point.date_collecte || point.updated_at || '').toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.sand[100] },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: PALETTE.sand[400],
    alignSelf: 'center', marginTop: SPACING.sm,
  },
  header: {
    flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: PALETTE.glass.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
  },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.base },
  titleRow: { gap: SPACING.md },
  pointName: {
    fontSize: TYPOGRAPHY.size['2xl'], fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.semiBold,
  },
  categoryRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
  },
  categoryEmoji: { fontSize: 24 },
  categoryLabel: {
    fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.semiBold,
  },
  photoContainer: {
    height: 220, borderRadius: RADIUS.lg, overflow: 'hidden',
    ...SHADOWS.soft,
  },
  photo: {
    width: '100%', height: '100%',
  },
  detailsCard: {},
  detailRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: PALETTE.sand[200],
  },
  detailText: {
    flex: 1, fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: PALETTE.text.primary, lineHeight: 22,
  },
  dateText: {
    fontSize: TYPOGRAPHY.size.xs, fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: PALETTE.text.tertiary, textAlign: 'center', marginTop: SPACING.md,
  },
});
