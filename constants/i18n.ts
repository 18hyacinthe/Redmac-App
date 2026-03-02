// CarteMa — Multilingual i18n System
// Arabic (RTL) · French · English

export type Language = 'ar' | 'fr' | 'en';

export const LANGUAGES: { code: Language; label: string; flag: string; rtl: boolean }[] = [
    { code: 'ar', label: 'العربية', flag: '🇲🇦', rtl: true },
    { code: 'fr', label: 'Français', flag: '🇫🇷', rtl: false },
    { code: 'en', label: 'English', flag: '🇬🇧', rtl: false },
];

export const translations = {
    // ===== HOME SCREEN =====
    home: {
        viewMap: { ar: 'عرض الخريطة', fr: 'Voir la carte', en: 'View the Map' },
        addPoint: { ar: 'إضافة نقطة', fr: 'Ajouter un point', en: 'Add a Point' },
        explore: { ar: 'استكشاف الإحصائيات', fr: 'Explorer les statistiques', en: 'Explore Statistics' },
        trustSeal: { ar: 'مشروع مواطني مغربي', fr: 'Projet citoyen Maroc', en: 'Moroccan Civic Project' },
        trustSubtext: { ar: 'سري · مفتوح · بسيط', fr: 'Confidentiel · Ouvert · Simple', en: 'Private · Open · Simple' },
        appName: { ar: 'كارتما', fr: 'CarteMa', en: 'CarteMa' },
    },

    // ===== MAP SCREEN =====
    map: {
        search: { ar: 'البحث عن مدينة أو حي...', fr: 'Rechercher une ville ou quartier...', en: 'Search a city or district...' },
        myLocation: { ar: 'موقعي', fr: 'Ma position', en: 'My Location' },
        filter: { ar: 'تصفية', fr: 'Filtrer', en: 'Filter' },
        loading: { ar: 'تحميل الخريطة...', fr: 'Chargement de la carte...', en: 'Loading map...' },
        validated: { ar: 'تم التحقق', fr: 'Validé', en: 'Validated' },
        pending: { ar: 'قيد الانتظار', fr: 'En attente', en: 'Pending' },
        rejected: { ar: 'مرفوض', fr: 'Rejeté', en: 'Rejected' },
        heatmap: { ar: 'خريطة الحرارة', fr: 'Carte de chaleur', en: 'Heatmap' },
        details: { ar: 'انقر للتفاصيل', fr: 'Appuyez pour voir les détails', en: 'Tap for details' },
        noResults: { ar: 'لا توجد نتائج', fr: 'Aucun point trouvé', en: 'No points found' },
    },

    // ===== ADD POINT WIZARD =====
    add: {
        step1Title: { ar: 'تأكيد الموقع', fr: 'Confirmer la position', en: 'Confirm Location' },
        step1Desc: { ar: 'موقعك الحالي', fr: 'Votre position actuelle', en: 'Your current position' },
        step1Btn: { ar: 'تأكيد الموقع', fr: 'Confirmer la position', en: 'Confirm Location' },
        step1Refresh: { ar: 'تحديث', fr: 'Actualiser', en: 'Refresh' },

        step2Title: { ar: 'اختر الفئة', fr: 'Quelle catégorie ?', en: 'Which category?' },
        step2Next: { ar: 'التالي', fr: 'Suivant', en: 'Next' },

        step3Title: { ar: 'التقاط صورة', fr: 'Prenez une photo', en: 'Take a Photo' },
        step3Desc: { ar: 'صورة نقطة البيع', fr: 'du point de vente', en: 'of the point of sale' },
        step3Camera: { ar: 'التقاط صورة', fr: 'Prendre une photo', en: 'Take a photo' },
        step3Gallery: { ar: 'اختيار من المعرض', fr: 'Choisir de la galerie', en: 'Choose from gallery' },
        step3Skip: { ar: 'تخطي هذه الخطوة', fr: 'Passer cette étape', en: 'Skip this step' },

        step4Title: { ar: 'وصف (اختياري)', fr: 'Ajouter un commentaire', en: 'Add a comment' },
        step4Optional: { ar: 'اختياري', fr: 'optionnel', en: 'optional' },
        step4Placeholder: { ar: 'صف نقطة البيع...', fr: 'Décrivez le point de vente...', en: 'Describe the point of sale...' },
        step4Voice: { ar: 'إملاء رسالتك', fr: 'Dicter votre message', en: 'Dictate your message' },

        step5Title: { ar: 'تأكيد المساهمة', fr: 'Résumé de votre contribution', en: 'Contribution Summary' },
        step5Position: { ar: 'تم تأكيد الموقع', fr: 'Position confirmée', en: 'Position confirmed' },
        step5Photo: { ar: 'تم إضافة صورة', fr: 'Photo ajoutée', en: 'Photo added' },
        step5NoPhoto: { ar: 'بدون صورة', fr: 'Pas de photo', en: 'No photo' },
        submit: { ar: 'إرسال', fr: 'Soumettre', en: 'Submit' },
        submitting: { ar: 'جاري الإرسال...', fr: 'Envoi en cours...', en: 'Sending...' },
        success: { ar: 'شكراً لك!', fr: 'Merci !', en: 'Thank you!' },
        successDesc: { ar: 'سيتم التحقق من مساهمتك', fr: 'Votre signalement sera vérifié par un contributeur.', en: 'Your report will be verified by a contributor.' },
        duplicate: { ar: '⚠️ نقطة مشابهة', fr: '⚠️ Point similaire détecté', en: '⚠️ Similar point found' },
        viewDuplicate: { ar: 'عرض النقطة', fr: 'Voir le point', en: 'View point' },
        continue: { ar: 'متابعة', fr: 'Continuer', en: 'Continue' },
        info: { ar: 'سيتم التحقق من قبل مساهم ميداني', fr: 'Vérifié par un contributeur terrain', en: 'Verified by a field contributor' },
        cancel: { ar: 'إلغاء', fr: 'Annuler', en: 'Cancel' },
        errorLocation: { ar: 'تعذر تحديد موقعك', fr: 'Impossible de déterminer votre position', en: 'Unable to determine your position' },
        errorCategory: { ar: 'يرجى اختيار فئة', fr: 'Veuillez sélectionner une catégorie', en: 'Please select a category' },
        back: { ar: 'رجوع', fr: 'Retour', en: 'Back' },
        stepOf: { ar: 'خطوة {current} من {total}', fr: 'Étape {current} sur {total}', en: 'Step {current} of {total}' },
    },

    // ===== STATS SCREEN =====
    stats: {
        title: { ar: 'الإحصائيات', fr: 'Statistiques', en: 'Statistics' },
        total: { ar: 'المجموع', fr: 'Total', en: 'Total' },
        validated: { ar: 'تم التحقق', fr: 'Validés', en: 'Validated' },
        pending: { ar: 'قيد الانتظار', fr: 'En attente', en: 'Pending' },
        byCity: { ar: 'حسب المدينة', fr: 'Contribution par ville', en: 'Contribution by city' },
        howItWorks: { ar: 'كيف يعمل؟', fr: 'Comment ça marche ?', en: 'How does it work?' },
        howStep1: { ar: 'ابحث عن نقطة بيع', fr: 'Trouvez un point de vente', en: 'Find a point of sale' },
        howStep2: { ar: 'التقط صورة', fr: 'Prenez une photo', en: 'Take a photo' },
        howStep3: { ar: 'أرسل، سيتم التحقق', fr: 'Envoyez, c\'est vérifié', en: 'Send, it gets verified' },
        privacy: { ar: 'بياناتك تبقى خاصة', fr: 'Vos données restent privées', en: 'Your data stays private' },
        openData: { ar: 'بيانات مفتوحة ومتحقق منها', fr: 'Données ouvertes & vérifiées', en: 'Open & verified data' },
        noAccount: { ar: 'لا حساب مطلوب', fr: 'Aucun compte requis', en: 'No account required' },
    },

    // ===== CATEGORIES =====
    categories: {
        EPICERIE: { ar: 'بقالة', fr: 'Épicerie', en: 'Grocery' },
        KIOSQUE: { ar: 'كشك', fr: 'Kiosque', en: 'Kiosk' },
        CAFE: { ar: 'مقهى', fr: 'Café', en: 'Café' },
        VENDEUR_AMBULANT: { ar: 'بائع متجول', fr: 'Vendeur ambulant', en: 'Street Vendor' },
        AUTRE: { ar: 'أخرى', fr: 'Autre', en: 'Other' },
    },

    // ===== STATUSES =====
    statuses: {
        VALIDE: { ar: 'تم التحقق', fr: 'Validé', en: 'Validated' },
        EN_ATTENTE: { ar: 'قيد الانتظار', fr: 'En attente', en: 'Pending' },
        REJETE: { ar: 'مرفوض', fr: 'Rejeté', en: 'Rejected' },
    },

    // ===== COMMON =====
    common: {
        home: { ar: 'الرئيسية', fr: 'Accueil', en: 'Home' },
        ok: { ar: 'حسناً', fr: 'OK', en: 'OK' },
        error: { ar: 'خطأ', fr: 'Erreur', en: 'Error' },
        retry: { ar: 'إعادة المحاولة', fr: 'Réessayer', en: 'Retry' },
        close: { ar: 'إغلاق', fr: 'Fermer', en: 'Close' },
        loading: { ar: 'جاري التحميل...', fr: 'Chargement...', en: 'Loading...' },
        offline: { ar: 'وضع عدم الاتصال', fr: 'Mode hors ligne', en: 'Offline mode' },
        voiceHint: { ar: 'انقر للاستماع', fr: 'Appuyez pour écouter', en: 'Tap to listen' },
    },

    // ===== POINT DETAIL =====
    point: {
        noName: { ar: 'بدون اسم', fr: 'Sans nom', en: 'Unnamed' },
        noDescription: { ar: 'بدون وصف', fr: 'Pas de description', en: 'No description' },
        noPhoto: { ar: 'بدون صورة', fr: 'Pas de photo', en: 'No photo' },
        hours: { ar: 'ساعات العمل', fr: 'Horaires', en: 'Hours' },
        landmark: { ar: 'معلم', fr: 'Repère', en: 'Landmark' },
        validatedOn: { ar: 'تم التحقق في', fr: 'Validé le', en: 'Validated on' },
    },
} as const;

// Helper type for translation keys
export type TranslationKey = keyof typeof translations;
export type Translations = typeof translations;
