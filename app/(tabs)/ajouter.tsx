import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin, Image as ImageIcon, Clock, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/providers/DataProvider';
import { useAuth } from '@/providers/AuthProvider';
import { CATEGORIES } from '@/constants/categories';
import { PointCategory } from '@/types';
import { useRouter } from 'expo-router';

export default function AjouterScreen() {
  const router = useRouter();
  const { addPoint } = useData();
  const { user, isGuest } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    latitude: 0,
    longitude: 0,
    categorie: 'EPICERIE' as PointCategory,
    nom_affiche: '',
    description: '',
    photo_url: '',
    horaires: '',
    repere: '',
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setFormData(prev => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }));
            },
            (error) => {
              console.log('Geolocation error:', error);
            }
          );
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setFormData(prev => ({
            ...prev,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }));
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, photo_url: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'Nous avons besoin d\'accéder à votre caméra');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, photo_url: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user && !isGuest) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour ajouter un point');
      router.push('/auth/login' as any);
      return;
    }

    if (!formData.categorie) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      Alert.alert('Erreur', 'Impossible de déterminer votre position');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addPoint({
        ...formData,
        nom_affiche: formData.nom_affiche || `Point de vente ${CATEGORIES.find(c => c.value === formData.categorie)?.label}`,
      });

      setIsSubmitting(false);

      if (result) {
        Alert.alert(
          'Merci !',
          'Votre signalement sera vérifié par un contributeur terrain.',
          [{
            text: 'OK', onPress: () => {
              setFormData({
                latitude: formData.latitude,
                longitude: formData.longitude,
                categorie: 'EPICERIE',
                nom_affiche: '',
                description: '',
                photo_url: '',
                horaires: '',
                repere: '',
              });
              router.push('/(tabs)/carte' as any);
            }
          }]
        );
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue');
      }
    } catch (error: any) {
      setIsSubmitting(false);
      if (error?.data?.duplicate) {
        Alert.alert(
          'Point similaire détecté',
          error.message || 'Un point similaire existe déjà à proximité',
          [
            { text: 'Voir le point', onPress: () => router.push(`/point/${error.data.duplicate.id}` as any) },
            { text: 'Annuler', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Erreur', error?.message || 'Une erreur est survenue');
      }
    }
  };

  if (!user && !isGuest) {
    return (
      <View style={styles.authContainer}>
        <MapPin size={64} color={Colors.light.tint} />
        <Text style={styles.authTitle}>Connexion requise</Text>
        <Text style={styles.authText}>
          Connectez-vous pour ajouter des points de vente
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajouter un point de vente</Text>
          <Text style={styles.subtitle}>Aidez à enrichir la carte</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <MapPin size={20} color={Colors.light.tint} />
            <Text style={styles.label}>Localisation</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </Text>
            <TouchableOpacity onPress={getCurrentLocation}>
              <Text style={styles.updateLocationText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Catégorie *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryButton,
                  formData.categorie === cat.value && styles.categoryButtonActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, categorie: cat.value }))}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.categorie === cat.value && styles.categoryButtonTextActive,
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nom du point (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Épicerie chez Mohammed"
            value={formData.nom_affiche}
            onChangeText={(text) => setFormData(prev => ({ ...prev, nom_affiche: text }))}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Repère / Près de... (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Près de la mosquée centrale"
            value={formData.repere}
            onChangeText={(text) => setFormData(prev => ({ ...prev, repere: text }))}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description (optionnel, max 200 caractères)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Quelques détails sur ce point de vente..."
            value={formData.description}
            onChangeText={(text) => {
              if (text.length <= 200) {
                setFormData(prev => ({ ...prev, description: text }));
              }
            }}
            multiline
            numberOfLines={3}
            maxLength={200}
            placeholderTextColor={Colors.light.textSecondary}
          />
          <Text style={styles.charCount}>{formData.description.length}/200</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Clock size={20} color={Colors.light.tint} />
            <Text style={styles.label}>Horaires (optionnel)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Ex: 8h-20h tous les jours"
            value={formData.horaires}
            onChangeText={(text) => setFormData(prev => ({ ...prev, horaires: text }))}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Photo (optionnel)</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Camera size={24} color={Colors.light.tint} />
              <Text style={styles.photoButtonText}>Prendre une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <ImageIcon size={24} color={Colors.light.tint} />
              <Text style={styles.photoButtonText}>Galerie</Text>
            </TouchableOpacity>
          </View>
          {formData.photo_url ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: formData.photo_url }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setFormData(prev => ({ ...prev, photo_url: '' }))}
              >
                <Text style={styles.removeImageText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.infoBox}>
          <AlertCircle size={20} color={Colors.light.warning} />
          <Text style={styles.infoText}>
            Votre signalement sera vérifié par un contributeur terrain avant d&apos;être publié sur la carte.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Envoi en cours...' : 'Soumettre le point'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  updateLocationText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600' as const,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600' as const,
  },
  categoryButtonTextActive: {
    color: Colors.light.card,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  photoButtonText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600' as const,
  },
  imagePreview: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.light.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeImageText: {
    color: Colors.light.card,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700' as const,
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
