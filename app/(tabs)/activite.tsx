import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Award, TrendingUp, CheckCircle, XCircle, Camera } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/providers/DataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { getActivityLabel } from '@/constants/categories';
import { useRouter } from 'expo-router';

export default function ActiviteScreen() {
  const router = useRouter();
  const { getUserActivities } = useData();
  const { user, isGuest } = useAuth();

  if (!user && !isGuest) {
    return (
      <View style={styles.authContainer}>
        <Award size={64} color={Colors.light.tint} />
        <Text style={styles.authTitle}>Connexion requise</Text>
        <Text style={styles.authText}>
          Connectez-vous pour voir votre activité et vos points
        </Text>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.push('/auth/login' as any)}
        >
          <Text style={styles.authButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activities = user ? getUserActivities(user.id) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pointsCard}>
          <Award size={32} color={Colors.light.tint} />
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Vos points</Text>
            <Text style={styles.pointsValue}>{user?.points || 0}</Text>
          </View>
        </View>
        <View style={styles.infoBox}>
          <TrendingUp size={20} color={Colors.light.success} />
          <Text style={styles.infoText}>
            Les points serviront plus tard à obtenir des bons de réduction chez des partenaires.
          </Text>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historique</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune activité pour le moment</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des points de vente pour gagner des points !
            </Text>
          </View>
        ) : (
          activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => {
                if (activity.point_id) {
                  router.push(`/point/${activity.point_id}` as any);
                }
              }}
            >
              <View style={styles.activityIcon}>
                {activity.type === 'VALIDATION_ACCEPTED' && (
                  <CheckCircle size={24} color={Colors.light.success} />
                )}
                {activity.type === 'VALIDATION_REJECTED' && (
                  <XCircle size={24} color={Colors.light.danger} />
                )}
                {activity.type === 'BONUS_PHOTO' && (
                  <Camera size={24} color={Colors.light.tint} />
                )}
                {activity.type === 'SUBMISSION' && (
                  <Award size={24} color={Colors.light.pending} />
                )}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityType}>{getActivityLabel(activity.type)}</Text>
                {activity.point?.nom_affiche && (
                  <Text style={styles.activityPoint}>{activity.point.nom_affiche}</Text>
                )}
                <Text style={styles.activityDate}>
                  {new Date(activity.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              {activity.delta_points > 0 && (
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>+{activity.delta_points}</Text>
                </View>
              )}
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
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  pointsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.light.tint,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.success,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  historyHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  activityCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  activityPoint: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  pointsBadge: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsBadgeText: {
    color: Colors.light.card,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  authContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  authButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
