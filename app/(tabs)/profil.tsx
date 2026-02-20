import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User, Shield, MapPin, Settings, LogOut, HelpCircle, Award, ListChecks, LayoutDashboard } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';

export default function ProfilScreen() {
  const router = useRouter();
  const { user, isGuest, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.push('/(tabs)/carte' as any);
          },
        },
      ]
    );
  };

  if (!user && !isGuest) {
    return (
      <View style={styles.authContainer}>
        <User size={64} color={Colors.light.tint} />
        <Text style={styles.authTitle}>Bienvenue</Text>
        <Text style={styles.authText}>
          Connectez-vous pour accéder à votre profil
        </Text>
        <TouchableOpacity 
          style={styles.authButton}
          onPress={() => router.push('/auth/login' as any)}
        >
          <Text style={styles.authButtonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.authButton, styles.registerButton]}
          onPress={() => router.push('/auth/register' as any)}
        >
          <Text style={[styles.authButtonText, styles.registerButtonText]}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isGuest) {
    return (
      <View style={styles.authContainer}>
        <User size={64} color={Colors.light.tint} />
        <Text style={styles.authTitle}>Mode invité</Text>
        <Text style={styles.authText}>
          Créez un compte pour profiter de toutes les fonctionnalités
        </Text>
        <TouchableOpacity 
          style={styles.authButton}
          onPress={() => router.push('/auth/register' as any)}
        >
          <Text style={styles.authButtonText}>Créer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.authButton, styles.registerButton]}
          onPress={() => router.push('/auth/login' as any)}
        >
          <Text style={[styles.authButtonText, styles.registerButtonText]}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'KAMDEM':
        return 'Kamdem (Contributeur)';
      case 'UTILISATEUR':
        return 'Utilisateur';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={24} color={Colors.light.danger} />;
      case 'KAMDEM':
        return <Award size={24} color={Colors.light.warning} />;
      default:
        return <User size={24} color={Colors.light.tint} />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBg} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {getRoleIcon(user?.role || 'UTILISATEUR')}
          </View>
          <Text style={styles.userName}>{user?.pseudo}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(user?.role || 'UTILISATEUR')}</Text>
          </View>
          {user?.ville_assignee && (
            <View style={styles.cityBadge}>
              <MapPin size={16} color={Colors.light.textSecondary} />
              <Text style={styles.cityText}>{user.ville_assignee}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}</Text>
            <Text style={styles.statLabel}>Jours</Text>
          </View>
        </View>

        {user?.role === 'KAMDEM' && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/kamdem/validation' as any)}
          >
            <View style={styles.menuIconContainer}>
              <ListChecks size={24} color={Colors.light.warning} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Points à valider</Text>
              <Text style={styles.menuSubtitle}>Validez les signalements</Text>
            </View>
          </TouchableOpacity>
        )}

        {user?.role === 'ADMIN' && (
          <>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/admin/dashboard' as any)}
            >
              <View style={styles.menuIconContainer}>
                <LayoutDashboard size={24} color={Colors.light.danger} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Dashboard Admin</Text>
                <Text style={styles.menuSubtitle}>Statistiques de la plateforme</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/admin/users' as any)}
            >
              <View style={styles.menuIconContainer}>
                <User size={24} color={Colors.light.danger} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Gestion utilisateurs</Text>
                <Text style={styles.menuSubtitle}>Gérer les rôles et accès</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Settings size={24} color={Colors.light.text} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Paramètres</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <HelpCircle size={24} color={Colors.light.text} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Aide & Support</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuIconContainer}>
              <LogOut size={24} color={Colors.light.danger} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: Colors.light.danger }]}>Déconnexion</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: Colors.light.tint,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  profileCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    color: Colors.light.card,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.light.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  version: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  authContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  authTitle: {
    fontSize: 28,
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
    marginBottom: 12,
  },
  authButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  registerButtonText: {
    color: Colors.light.tint,
  },
});
