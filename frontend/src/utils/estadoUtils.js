export const normalizeEstado = (estado) => {
    if (!estado) return 'al dia';
    try {
        const s = String(estado).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
        if (s.includes('mora') || s.includes('pendient')) return 'pendiente';
        if (s.includes('por vencer') || s.includes('porvencer') || s.includes('porvenc')) return 'por vencer';
        if (s.includes('pagad')) return 'pagado';
        if (s.includes('al dia') || s === 'aldia') return 'al dia';
        return s;
    } catch {
        const s = String(estado).toLowerCase();
        if (s.includes('mora') || s.includes('pendient')) return 'pendiente';
        if (s.includes('por vencer')) return 'por vencer';
        if (s.includes('pagad')) return 'pagado';
        if (s.includes('al dia') || s === 'aldia') return 'al dia';
        return 'al dia';
    }
};

export const getBadgeColors = (estado) => {
    const key = normalizeEstado(estado);
    switch (key) {
        case 'pendiente': return 'bg-red-600 text-white';
        case 'por vencer': return 'bg-yellow-500 text-black';
        case 'pagado':
        case 'al dia': return 'bg-green-600 text-white';
        default: return 'bg-gray-400 text-white';
    }
};

export const getRowBackgroundColor = (estado) => {
    const key = normalizeEstado(estado);
    switch (key) {
        // usar opacidad para dejar el color un poco menos intenso que bg-100,
        // pero más que bg-50: ej. bg-red-100/80
    // menos intensidad que antes: usar opacidades más bajas (/65, /60)
    case 'pendiente': return 'bg-red-100/65';
    case 'por vencer': return 'bg-yellow-100/65';
    case 'pagado':
    case 'al dia': return 'bg-green-100/65';
        default: return '';
    }
};

export const getUnderlineColor = (estado) => {
    const key = normalizeEstado(estado);
    switch (key) {
        case 'pendiente': return 'border-red-600';
        case 'por vencer': return 'border-yellow-400';
        case 'pagado':
        case 'al dia': return 'border-green-600';
        default: return 'border-gray-400';
    }
};

export const formatCurrency = (value) => {
    try {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(Number(value) || 0);
    } catch {
        return `$${(Number(value) || 0).toFixed(2)}`;
    }
};
