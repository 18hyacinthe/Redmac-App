import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Gift, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PALETTE, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import GlassSurface from '@/components/GlassSurface';
import ActionButton from '@/components/ActionButton';
import { useAuth } from '@/providers/AuthProvider';

import api from '@/services/api';

const PARTNER_LOGOS: Record<string, any> = {
    MARJANE: require('../assets/marjane.png'),
    COCACOLA: require('../assets/cocacola.png'),
    TOTALENERGY: require('../assets/totalenergy.png'),
};

const OFFERS = [
    { id: 1, partner: 'MARJANE', value: 50, cost: 100 },
    { id: 2, partner: 'TOTALENERGY', value: 100, cost: 200 },
    { id: 3, partner: 'COCACOLA', value: 60, cost: 100 },
];

export default function VouchersScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // En attendant d'avoir le vrai endpoint POST /api/auth/vouchers/exchange on mock avec une alerte
    const handleExchange = (offer: typeof OFFERS[0]) => {
        Alert.alert(
            "Confirmer l'échange",
            `Voulez-vous vraiment échanger ${offer.cost} points contre un bon de ${offer.value} MAD chez ${offer.partner} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            // Appel réel au backend
                            await api.exchangeVoucher(offer.cost, offer.partner);

                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            Alert.alert(
                                "Félicitations !",
                                "L'échange a réussi, le bon apparaîtra dans vos cadeaux.",
                                [{ text: 'OK', onPress: () => router.back() }]
                            );
                        } catch (error: any) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            Alert.alert(
                                "Échec",
                                error?.message || "Erreur lors de l'échange ou solde de points insuffisant.",
                            );
                        } finally {
                            setIsSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={PALETTE.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Boutique Cadeaux</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoBox}>
                    <Gift size={24} color={PALETTE.status.validated} />
                    <Text style={styles.infoText}>
                        Échangez vos points validés contre des bons d'achat chez nos partenaires !
                    </Text>
                </View>

                {OFFERS.map((offer) => (
                    <GlassSurface key={offer.id} style={styles.offerCard}>
                        <View style={styles.offerHeader}>
                            <View style={styles.logoContainer}>
                                <Image source={PARTNER_LOGOS[offer.partner]} style={styles.logo} resizeMode="contain" />
                            </View>
                            <View style={styles.offerInfo}>
                                <Text style={styles.partnerName}>{offer.partner}</Text>
                                <Text style={styles.offerValue}>Bon d'achat de {offer.value} MAD</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.offerFooter}>
                            <Text style={styles.offerCost}>{offer.cost} Points</Text>
                            <TouchableOpacity
                                style={styles.exchangeBtn}
                                onPress={() => handleExchange(offer)}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.exchangeBtnText}>Échanger</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassSurface>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: PALETTE.sand[100] },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: {
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: PALETTE.glass.white, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.size.xl, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    content: { padding: SPACING.lg, gap: SPACING.lg },
    infoBox: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        backgroundColor: PALETTE.status.validatedBg, padding: SPACING.md, borderRadius: RADIUS.md,
    },
    infoText: {
        flex: 1, fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: PALETTE.status.validated,
    },
    offerCard: { gap: SPACING.md },
    offerHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    logoContainer: {
        width: 70, height: 70, borderRadius: RADIUS.lg, backgroundColor: PALETTE.sand[100],
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        borderWidth: 1, borderColor: PALETTE.glass.whiteBorder,
    },
    logo: { width: 50, height: 50 },
    offerInfo: { flex: 1 },
    partnerName: {
        fontSize: TYPOGRAPHY.size.base, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.primary,
    },
    offerValue: {
        fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.clay[500], marginTop: SPACING.xs,
    },
    divider: { height: 1, backgroundColor: PALETTE.sand[200] },
    offerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    offerCost: {
        fontSize: TYPOGRAPHY.size.lg, fontFamily: TYPOGRAPHY.fontFamily.bold, color: '#FFB800',
    },
    exchangeBtn: {
        backgroundColor: PALETTE.clay[500], paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm,
    },
    exchangeBtnText: {
        fontSize: TYPOGRAPHY.size.sm, fontFamily: TYPOGRAPHY.fontFamily.bold, color: PALETTE.text.inverse,
    },
});
