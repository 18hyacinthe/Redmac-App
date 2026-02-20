import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/providers/DataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { getCategoryLabel } from '@/constants/categories';

export default function ValidationScreen() {
  const router = useRouter();
  const { getPointsToValidate } = useData();
  const { user } = useAuth();

  const pointsToValidate = getPointsToValidate(user?.ville_assignee);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Points à valider</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{pointsToValidate.length}</Text>
        </View>
      </View>

      {user?.ville_assignee && (
        <View style={styles.filterInfo}>
          <MapPin size={16} color={Colors.light.tint} />
          <Text style={styles.filterText}>Zone : {user.ville_assignee}</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {pointsToValidate.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun point en attente</Text>
            <Text style={styles.emptySubtext}>
              Tous les points de votre zone ont été traités !
            </Text>
          </View>
        ) : (
          pointsToValidate.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={styles.card}
              onPress={() => router.push(`/point/${point.id}` as any)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardName}>{point.nom_affiche}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{getCategoryLabel(point.categorie)}</Text>
                  </View>
                </View>
                <ArrowRight size={20} color={Colors.light.textSecondary} />
              </View>

              {point.repere && (
                <View style={styles.cardInfo}>
                  <MapPin size={14} color={Colors.light.textSecondary} />
                  <Text style={styles.cardInfoText}>{point.repere}</Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <View style={styles.cardMeta}>
                  <Calendar size={14} color={Colors.light.textSecondary} />
                  <Text style={styles.cardMetaText}>
                    {new Date(point.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                {point.photo_url && (
                  <View style={styles.photoBadge}>
                    <Text style={styles.photoText}>📷 Photo</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
  },
  countBadge: {
    backgroundColor: Colors.light.warning,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: Colors.light.card,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
    gap: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  categoryBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '600' as const,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardInfoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  photoBadge: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoText: {
    fontSize: 12,
    color: Colors.light.card,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
