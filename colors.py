"""
Semantic Color System - Design Tokens
Fixes color overshadowing and establishes clear visual hierarchy
"""

# Base Color Palette
BASE_COLORS = {
    # Primary Brand Colors
    'primary': {
        50: '#f0f9ff',   # Lightest tint
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',  # Base primary
        600: '#0284c7',  # Default interactive
        700: '#0369a1',  # Hover state
        800: '#075985',  # Active state
        900: '#0c4a6e',  # Darkest shade
    },
    
    # Neutral Colors (Backgrounds, Text, Borders)
    'neutral': {
        0: '#ffffff',    # Pure white
        50: '#f8fafc',   # Background light
        100: '#f1f5f9',  # Background subtle
        200: '#e2e8f0',  # Border light
        300: '#cbd5e1',  # Border default
        400: '#94a3b8',  # Text muted
        500: '#64748b',  # Text secondary
        600: '#475569',  # Text primary light
        700: '#334155',  # Text primary
        800: '#1e293b',  # Background dark
        900: '#0f172a',  # Background darkest
        1000: '#000000', # Pure black
    },
    
    # Semantic Status Colors
    'success': {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',  # Base success
        600: '#16a34a',  # Default
        700: '#15803d',  # Hover
        800: '#166534',  # Active
        900: '#14532d',
    },
    
    'warning': {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',  # Base warning
        600: '#d97706',  # Default
        700: '#b45309',  # Hover
        800: '#92400e',  # Active
        900: '#78350f',
    },
    
    'danger': {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',  # Base danger
        600: '#dc2626',  # Default
        700: '#b91c1c',  # Hover
        800: '#991b1b',  # Active
        900: '#7f1d1d',
    },
}

# Semantic Color Assignments
SEMANTIC_COLORS = {
    # Text Hierarchy
    'text': {
        'primary': BASE_COLORS['neutral'][700],      # Main content
        'secondary': BASE_COLORS['neutral'][500],    # Supporting text
        'muted': BASE_COLORS['neutral'][400],        # Subtle text
        'inverse': BASE_COLORS['neutral'][0],        # White text on dark
        'disabled': BASE_COLORS['neutral'][300],     # Disabled state
    },
    
    # Background Hierarchy
    'background': {
        'primary': BASE_COLORS['neutral'][0],        # Main background
        'secondary': BASE_COLORS['neutral'][50],     # Card backgrounds
        'tertiary': BASE_COLORS['neutral'][100],     # Subtle sections
        'inverse': BASE_COLORS['neutral'][900],      # Dark mode primary
        'overlay': 'rgba(15, 23, 42, 0.8)',         # Modal overlays
    },
    
    # Interactive States
    'interactive': {
        'primary': {
            'default': BASE_COLORS['primary'][600],
            'hover': BASE_COLORS['primary'][700],
            'active': BASE_COLORS['primary'][800],
        },
        'success': {
            'default': BASE_COLORS['success'][600],
            'hover': BASE_COLORS['success'][700],
            'active': BASE_COLORS['success'][800],
        },
        'warning': {
            'default': BASE_COLORS['warning'][600],
            'hover': BASE_COLORS['warning'][700],
            'active': BASE_COLORS['warning'][800],
        },
        'danger': {
            'default': BASE_COLORS['danger'][600],
            'hover': BASE_COLORS['danger'][700],
            'active': BASE_COLORS['danger'][800],
        }
    },
    
    # Financial Specific Colors
    'financial': {
        'positive': BASE_COLORS['success'][600],     # Gains, income
        'negative': BASE_COLORS['danger'][600],      # Losses, expenses
        'neutral': BASE_COLORS['neutral'][500],      # Neutral amounts
        'pending': BASE_COLORS['warning'][600],      # Pending transactions
    }
}

# Dark Mode Overrides
DARK_MODE_COLORS = {
    'text': {
        'primary': BASE_COLORS['neutral'][100],
        'secondary': BASE_COLORS['neutral'][300],
        'muted': BASE_COLORS['neutral'][400],
        'inverse': BASE_COLORS['neutral'][900],
    },
    'background': {
        'primary': BASE_COLORS['neutral'][900],
        'secondary': BASE_COLORS['neutral'][800],
        'tertiary': BASE_COLORS['neutral'][700],
        'inverse': BASE_COLORS['neutral'][0],
    }
}

def get_color(path, dark_mode=False):
    """Get color by semantic path (e.g., 'text.primary')"""
    colors = {**SEMANTIC_COLORS, **(DARK_MODE_COLORS if dark_mode else {})}
    keys = path.split('.')
    
    try:
        result = colors
        for key in keys:
            result = result[key]
        return result
    except (KeyError, TypeError):
        return '#000000'