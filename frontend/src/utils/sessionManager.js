/**
 * Sistema de gestión de múltiples sesiones para evitar conflictos
 * cuando se abren varias pestañas con diferentes usuarios/roles
 */

// Generar un ID único para cada pestaña
const getTabId = () => {
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
        tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('tabId', tabId);
    }
    return tabId;
};

// Guardar sesión específica para esta pestaña
export const saveSession = (token, usuario) => {
    const tabId = getTabId();
    
    // Guardar en sessionStorage (específico de esta pestaña)
    sessionStorage.setItem(`token_${tabId}`, token);
    sessionStorage.setItem(`usuario_${tabId}`, JSON.stringify(usuario));
    
    // También guardar en localStorage con el tabId para referencias
    localStorage.setItem('currentTabId', tabId);
    
    // Guardar también en localStorage tradicional como fallback
    localStorage.setItem('token', token);
    localStorage.setItem('Usuario', JSON.stringify(usuario));
};

// Obtener sesión de esta pestaña
export const getSession = () => {
    const tabId = getTabId();
    
    // Intentar obtener de sessionStorage primero (específico de pestaña)
    const tokenSession = sessionStorage.getItem(`token_${tabId}`);
    const usuarioSession = sessionStorage.getItem(`usuario_${tabId}`);
    
    if (tokenSession && usuarioSession) {
        return {
            token: tokenSession,
            usuario: JSON.parse(usuarioSession)
        };
    }
    
    // Fallback a localStorage si no existe en sessionStorage
    const tokenLocal = localStorage.getItem('token');
    const usuarioLocal = localStorage.getItem('Usuario');
    
    if (tokenLocal && usuarioLocal) {
        // Copiar a sessionStorage para futuras lecturas
        sessionStorage.setItem(`token_${tabId}`, tokenLocal);
        sessionStorage.setItem(`usuario_${tabId}`, usuarioLocal);
        
        return {
            token: tokenLocal,
            usuario: JSON.parse(usuarioLocal)
        };
    }
    
    return null;
};

// Obtener solo el token
export const getToken = () => {
    const session = getSession();
    return session ? session.token : null;
};

// Obtener solo el usuario
export const getUsuario = () => {
    const session = getSession();
    return session ? session.usuario : null;
};

// Verificar si la sesión es válida para el rol esperado
export const isValidSession = (expectedRole) => {
    const session = getSession();
    if (!session) return false;
    
    const rol = (session.usuario?.rol || '').toLowerCase();
    const expected = expectedRole.toLowerCase();
    
    return rol === expected || 
           (expected === 'admin' && (rol === 'administrador' || rol === 'administrator'));
};

// Limpiar sesión de esta pestaña
export const clearSession = () => {
    const tabId = getTabId();
    
    // Limpiar sessionStorage
    sessionStorage.removeItem(`token_${tabId}`);
    sessionStorage.removeItem(`usuario_${tabId}`);
    
    // Limpiar localStorage solo si es la última pestaña
    // (esto es opcional, pero ayuda a limpiar cuando se cierra todo)
    const currentTabId = localStorage.getItem('currentTabId');
    if (currentTabId === tabId) {
        localStorage.removeItem('token');
        localStorage.removeItem('Usuario');
        localStorage.removeItem('currentTabId');
    }
};

// Verificar si el usuario actual es administrador
export const isAdmin = () => {
    const usuario = getUsuario();
    if (!usuario) return false;
    
    const rol = (usuario.rol || '').toLowerCase();
    return rol === 'admin' || rol === 'administrador' || rol === 'administrator';
};

// Verificar si el usuario actual es residente
export const isResidente = () => {
    const usuario = getUsuario();
    if (!usuario) return false;
    
    const rol = (usuario.rol || '').toLowerCase();
    return rol === 'residente' || rol === 'resident';
};
