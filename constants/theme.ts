// CarteMa — Liquid Glass Design System
// Premium, calm, institutional design tokens

export const PALETTE = {
    // === Warm Neutral Base ===
    sand: {
        50: '#FDFCFA',
        100: '#F8F5F0',
        200: '#F0EBE3',
        300: '#E4DDD3',
        400: '#C9BFB2',
        500: '#A89A8B',
        600: '#8B7D6E',
    },

    // === Deep Moroccan Clay (Primary) ===
    clay: {
        400: '#D4845C',
        500: '#C65D3B',
        600: '#A8492E',
        700: '#8B3A24',
    },

    // === Status Colors ===
    status: {
        validated: '#6B8E4E',
        validatedBg: 'rgba(107, 142, 78, 0.10)',
        pending: '#D4A373',
        pendingBg: 'rgba(212, 163, 115, 0.10)',
        rejected: '#B54E35',
        rejectedBg: 'rgba(181, 78, 53, 0.10)',
    },

    // === Glass System ===
    glass: {
        white: 'rgba(255, 255, 255, 0.72)',
        whiteBorder: 'rgba(255, 255, 255, 0.24)',
        whiteHover: 'rgba(255, 255, 255, 0.82)',
        dark: 'rgba(26, 26, 26, 0.65)',
        darkBorder: 'rgba(255, 255, 255, 0.08)',
        blur: 16,
        blurHeavy: 24,
    },

    // === Semantic Text ===
    text: {
        primary: '#2D1810',
        secondary: '#6B5D52',
        tertiary: '#A89A8B',
        inverse: '#FDFCFA',
    },

    // === Fixed ===
    white: '#FFFFFF',
    black: '#1A1A1A',
    userLocation: '#4285F4',
} as const;

export const TYPOGRAPHY = {
    fontFamily: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semiBold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
    },

    size: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 22,
        '2xl': 28,
        '3xl': 36,
        '4xl': 48,
    },

    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.7,
    },
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
} as const;

export const RADIUS = {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 28,
    full: 9999,
} as const;

export const SHADOWS = {
    soft: {
        shadowColor: 'rgba(0, 0, 0, 0.06)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 3,
    },
    medium: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 5,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 4,
    }),
} as const;

// Category visual definitions
export const CATEGORY_VISUALS = {
    EPICERIE: {
        icon: 'ShoppingBag' as const,
        emoji: '🏪',
        color: '#6B8E4E',
        bgColor: 'rgba(107, 142, 78, 0.12)',
    },
    KIOSQUE: {
        icon: 'Newspaper' as const,
        emoji: '📰',
        color: '#4A90A4',
        bgColor: 'rgba(74, 144, 164, 0.12)',
    },
    CAFE: {
        icon: 'Coffee' as const,
        emoji: '☕',
        color: '#8B6E4E',
        bgColor: 'rgba(139, 110, 78, 0.12)',
    },
    VENDEUR_AMBULANT: {
        icon: 'ShoppingCart' as const,
        emoji: '🛒',
        color: '#D4A373',
        bgColor: 'rgba(212, 163, 115, 0.12)',
    },
    AUTRE: {
        icon: 'Store' as const,
        emoji: '🏬',
        color: '#A89A8B',
        bgColor: 'rgba(168, 154, 139, 0.12)',
    },
} as const;

// Map marker colors
export const MAP_COLORS = {
    valide: PALETTE.status.validated,
    enAttente: PALETTE.status.pending,
    rejete: PALETTE.status.rejected,
} as const;
