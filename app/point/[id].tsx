import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Calendar, User as UserIcon, CheckCircle, Edit3, XCircle, Navigation, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/providers/DataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { getCategoryLabel, getStatusLabel } from '@/constants/categories';

export default function PointDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { points, validatePoint, updatePoint } = useData();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nom_affiche: '',
    description: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const point = points.find(p => p.id === id);

  if (!point) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Point introuvable</Text>
      </View>
    );
  }

  const handleValidate = () => {
    Alert.alert(
      'Valider ce point',
      'Confirmez-vous que ce point de vente existe et que les informations sont correctes ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async () => {
            await validatePoint(point.id, 'VALIDE');
            Alert.alert('Validé', 'Le point a été validé avec succès', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer un motif de rejet');
      return;
    }

    await validatePoint(point.id, 'REJETE', rejectReason);
    setShowRejectModal(false);
    Alert.alert('Rejeté', 'Le point a été rejeté', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleEdit = () => {
    setEditData({
      nom_affiche: point.nom_affiche,
      description: point.description || '',
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    await updatePoint(point.id, editData);
    setIsEditing(false);
    Alert.alert('Modifié', 'Les informations ont été mises à jour');
  };

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${point.latitude},${point.longitude}`,
      android: `geo:0,0?q=${point.latitude},${point.longitude}`,
      web: `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return Colors.light.success;
      case 'EN_ATTENTE':
        return Colors.light.warning;
      case 'REJETE':
        return Colors.light.danger;
      default:
        return Colors.light.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {point.photo_url ? (
          <Image source={{ uri: point.photo_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <MapPin size={48} color={Colors.light.textSecondary} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            {isEditing ? (
              <TextInput
                style={styles.titleInput}
                value={editData.nom_affiche}
                onChangeText={(text) => setEditData({ ...editData, nom_affiche: text })}
                placeholder="Nom du point"
              />
            ) : (
              <Text style={styles.title}>{point.nom_affiche}</Text>
            )}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(point.statut) }]}>
              <Text style={styles.statusText}>{getStatusLabel(point.statut)}</Text>
            </View>
          </View>

          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{getCategoryLabel(point.categorie)}</Text>
            </View>
          </View>

          {point.repere && (
            <View style={styles.infoRow}>
              <MapPin size={18} color={Colors.light.tint} />
              <Text style={styles.infoText}>{point.repere}</Text>
            </View>
          )}

          {point.horaires && (
            <View style={styles.infoRow}>
              <Calendar size={18} color={Colors.light.tint} />
              <Text style={styles.infoText}>{point.horaires}</Text>
            </View>
          )}

          {point.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={styles.descriptionInput}
                  value={editData.description}
                  onChangeText={(text) => setEditData({ ...editData, description: text })}
                  placeholder="Description"
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.descriptionText}>{point.description}</Text>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <Text style={styles.coordinates}>
              {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
            </Text>
            {point.ville && (
              <Text style={styles.cityText}>
                {point.ville}{point.quartier ? `, ${point.quartier}` : ''}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.metaRow}>
              <UserIcon size={16} color={Colors.light.textSecondary} />
              <Text style={styles.metaText}>
                Soumis par {point.created_by?.pseudo || 'Anonyme'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Calendar size={16} color={Colors.light.textSecondary} />
              <Text style={styles.metaText}>
                {new Date(point.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {point.validation_comment && (
            <View style={styles.rejectionBox}>
              <AlertTriangle size={20} color={Colors.light.danger} />
              <View style={styles.rejectionContent}>
                <Text style={styles.rejectionTitle}>Motif de rejet</Text>
                <Text style={styles.rejectionText}>{point.validation_comment}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
            <Navigation size={20} color={Colors.light.card} />
            <Text style={styles.mapsButtonText}>Itinéraire</Text>
          </TouchableOpacity>

          {user?.role === 'KAMDEM' && point.statut === 'EN_ATTENTE' && (
            <View style={styles.actions}>
              {isEditing ? (
                <>
                  <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.validateButton} onPress={handleValidate}>
                    <CheckCircle size={20} color={Colors.light.card} />
                    <Text style={styles.validateButtonText}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <Edit3 size={20} color={Colors.light.tint} />
                    <Text style={styles.editButtonText}>Corriger</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                    <XCircle size={20} color={Colors.light.danger} />
                    <Text style={styles.rejectButtonText}>Rejeter</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {showRejectModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Motif de rejet</Text>
            <TextInput
              style={styles.rejectInput}
              placeholder="Indiquez le motif (doublon, mauvais emplacement, etc.)"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmReject}>
                <Text style={styles.modalConfirmText}>Rejeter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.light.border,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginRight: 12,
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tint,
    paddingBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.light.card,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: Colors.light.card,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  section: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  descriptionInput: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  coordinates: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: 'monospace' as const,
    marginBottom: 4,
  },
  cityText: {
    fontSize: 15,
    color: Colors.light.text,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  rejectionBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.danger,
    marginTop: 16,
  },
  rejectionContent: {
    flex: 1,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.danger,
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  mapsButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  mapsButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  validateButton: {
    backgroundColor: Colors.light.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  validateButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  editButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  editButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  rejectButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  rejectButtonText: {
    color: Colors.light.danger,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    backgroundColor: Colors.light.success,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  cancelButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.light.danger,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.card,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
