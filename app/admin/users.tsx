import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Shield, User as UserIcon, Award, Ban, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/providers/DataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';

export default function AdminUsersScreen() {
  const { users, updateUserRole, blockUser } = useData();
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Accès non autorisé</Text>
      </View>
    );
  }

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    Alert.alert(
      'Changer le rôle',
      `Voulez-vous vraiment changer le rôle de cet utilisateur en ${getRoleLabel(newRole)} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            await updateUserRole(userId, newRole);
            setSelectedUser(null);
            Alert.alert('Modifié', 'Le rôle a été mis à jour');
          },
        },
      ]
    );
  };

  const handleBlockUser = (userId: string, blocked: boolean) => {
    Alert.alert(
      blocked ? 'Bloquer' : 'Débloquer',
      `Voulez-vous vraiment ${blocked ? 'bloquer' : 'débloquer'} cet utilisateur ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: blocked ? 'destructive' : 'default',
          onPress: async () => {
            await blockUser(userId, blocked);
            Alert.alert('Modifié', `L'utilisateur a été ${blocked ? 'bloqué' : 'débloqué'}`);
          },
        },
      ]
    );
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'KAMDEM':
        return 'Kamdem';
      case 'UTILISATEUR':
        return 'Utilisateur';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={20} color={Colors.light.danger} />;
      case 'KAMDEM':
        return <Award size={20} color={Colors.light.warning} />;
      default:
        return <UserIcon size={20} color={Colors.light.tint} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestion utilisateurs</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{users.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {users.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun utilisateur</Text>
          </View>
        ) : (
          users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <TouchableOpacity
                style={styles.userHeader}
                onPress={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
              >
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    {getRoleIcon(user.role)}
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.pseudo}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.badges}>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) }]}>
                        <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
                      </View>
                      {user.is_blocked && (
                        <View style={styles.blockedBadge}>
                          <Text style={styles.blockedText}>Bloqué</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <Text style={styles.pointsText}>{user.points} pts</Text>
              </TouchableOpacity>

              {selectedUser === user.id && (
                <View style={styles.userActions}>
                  <Text style={styles.actionsTitle}>Changer le rôle</Text>
                  <View style={styles.roleButtons}>
                    {(['UTILISATEUR', 'KAMDEM', 'ADMIN'] as UserRole[]).map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleButton,
                          user.role === role && styles.roleButtonActive,
                        ]}
                        onPress={() => handleChangeRole(user.id, role)}
                        disabled={user.role === role}
                      >
                        <Text style={[
                          styles.roleButtonText,
                          user.role === role && styles.roleButtonTextActive,
                        ]}>
                          {getRoleLabel(role)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.blockButton,
                      user.is_blocked && styles.unblockButton,
                    ]}
                    onPress={() => handleBlockUser(user.id, !user.is_blocked)}
                  >
                    {user.is_blocked ? (
                      <>
                        <Check size={16} color={Colors.light.success} />
                        <Text style={[styles.blockButtonText, { color: Colors.light.success }]}>
                          Débloquer
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ban size={16} color={Colors.light.danger} />
                        <Text style={[styles.blockButtonText, { color: Colors.light.danger }]}>
                          Bloquer
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return Colors.light.danger;
    case 'KAMDEM':
      return Colors.light.warning;
    default:
      return Colors.light.tint;
  }
};

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
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
  },
  countBadge: {
    backgroundColor: Colors.light.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countText: {
    color: Colors.light.card,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  userCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    color: Colors.light.card,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  blockedBadge: {
    backgroundColor: Colors.light.danger,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  blockedText: {
    color: Colors.light.card,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.tint,
  },
  userActions: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  roleButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  roleButtonTextActive: {
    color: Colors.light.card,
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.danger,
  },
  unblockButton: {
    borderColor: Colors.light.success,
  },
  blockButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
