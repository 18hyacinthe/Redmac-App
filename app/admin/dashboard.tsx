import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart3, MapPin, Users, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/providers/DataProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { getStats } = useData();
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Accès non autorisé</Text>
      </View>
    );
  }

  const stats = getStats();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <BarChart3 size={32} color={Colors.light.danger} />
          <Text style={styles.title}>Dashboard</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: Colors.light.tint }]}>
            <MapPin size={24} color={Colors.light.tint} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total points</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: Colors.light.success }]}>
            <CheckCircle size={24} color={Colors.light.success} />
            <Text style={styles.statValue}>{stats.valides}</Text>
            <Text style={styles.statLabel}>Validés</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: Colors.light.warning }]}>
            <Clock size={24} color={Colors.light.warning} />
            <Text style={styles.statValue}>{stats.enAttente}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: Colors.light.danger }]}>
            <XCircle size={24} color={Colors.light.danger} />
            <Text style={styles.statValue}>{stats.rejetes}</Text>
            <Text style={styles.statLabel}>Rejetés</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition par ville</Text>
          {Object.entries(stats.parVille).length > 0 ? (
            Object.entries(stats.parVille)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([ville, count]) => (
                <View key={ville} style={styles.cityRow}>
                  <View style={styles.cityInfo}>
                    <MapPin size={16} color={Colors.light.tint} />
                    <Text style={styles.cityName}>{ville}</Text>
                  </View>
                  <View style={styles.cityCount}>
                    <Text style={styles.cityCountText}>{count as number}</Text>
                  </View>
                </View>
              ))
          ) : (
            <Text style={styles.emptyText}>Aucune donnée disponible</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.usersButton}
          onPress={() => router.push('/admin/users' as any)}
        >
          <Users size={20} color={Colors.light.card} />
          <Text style={styles.usersButtonText}>Gérer les utilisateurs</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityName: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  cityCount: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cityCountText: {
    fontSize: 14,
    color: Colors.light.card,
    fontWeight: '700' as const,
  },
  usersButton: {
    backgroundColor: Colors.light.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  usersButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
