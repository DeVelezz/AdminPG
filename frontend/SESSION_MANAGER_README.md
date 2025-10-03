# Sistema de Gestión de Múltiples Sesiones

## Problema Resuelto

Cuando se abrían múltiples pestañas del navegador con diferentes usuarios o roles (por ejemplo, una pestaña con admin y otra con un residente), ambas pestañas compartían el mismo `localStorage`, causando conflictos:

- El token de un usuario sobrescribía el token del otro
- Los datos del usuario se mezclaban entre pestañas
- Aparecían errores 403 Forbidden al intentar acceder a recursos
- Los usuarios eran expulsados inesperadamente al login

## Solución Implementada

Hemos implementado un **sistema de gestión de sesiones por pestaña** que utiliza:

1. **sessionStorage**: Almacena los datos específicos de cada pestaña (no se comparte entre pestañas)
2. **localStorage**: Mantiene una copia de respaldo para persistencia
3. **Tab ID único**: Cada pestaña recibe un identificador único al cargar

### Cómo Funciona

#### 1. Al Iniciar Sesión
```javascript
saveSession(token, usuario);
```
- Genera un ID único para la pestaña actual
- Guarda el token y usuario en `sessionStorage` con el prefijo del Tab ID
- También guarda en `localStorage` como fallback

#### 2. Al Leer la Sesión
```javascript
const token = getToken();
const usuario = getUsuario();
```
- Primero intenta leer desde `sessionStorage` (específico de la pestaña)
- Si no existe, usa `localStorage` como fallback
- Cada pestaña mantiene su propia copia independiente

#### 3. Al Cerrar Sesión
```javascript
clearSession();
```
- Limpia solo los datos de `sessionStorage` de esta pestaña
- Limpia `localStorage` solo si es la última pestaña activa

## Uso en los Componentes

### PageLogin.jsx
```javascript
import { saveSession } from '../utils/sessionManager';

// Al hacer login exitoso
saveSession(res.data.token, res.data.usuario);
```

### PageAdmin.jsx / PageResidente.jsx
```javascript
import { getToken, getUsuario, isAdmin, clearSession } from '../utils/sessionManager';

// Obtener token para API calls
const token = getToken();

// Obtener datos del usuario
const usuario = getUsuario();

// Verificar si es admin
if (!isAdmin()) {
    // Redirigir o mostrar error
}

// Cerrar sesión
const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
};
```

## Funciones Disponibles

### `saveSession(token, usuario)`
Guarda la sesión en sessionStorage y localStorage.

### `getSession()`
Retorna el objeto completo `{ token, usuario }` o `null`.

### `getToken()`
Retorna solo el token de la sesión actual.

### `getUsuario()`
Retorna solo el objeto usuario de la sesión actual.

### `isAdmin()`
Verifica si el usuario actual tiene rol de administrador.

### `isResidente()`
Verifica si el usuario actual tiene rol de residente.

### `clearSession()`
Limpia la sesión de la pestaña actual.

### `isValidSession(expectedRole)`
Verifica si la sesión tiene el rol esperado.

## Beneficios

✅ **Múltiples pestañas simultáneas**: Puedes abrir varias pestañas con diferentes usuarios sin conflictos

✅ **Independencia entre pestañas**: Cada pestaña mantiene su propia sesión

✅ **Sin recargas inesperadas**: No más expulsiones al login cuando cambias de pestaña

✅ **Persistencia**: Si cierras y abres una pestaña, la sesión se recupera

✅ **Seguridad**: Cada pestaña verifica su propio token

## Escenarios de Uso

### Escenario 1: Admin revisando múltiples residentes
- Pestaña 1: Sesión de admin
- Pestaña 2: Vista de residente A (desde admin)
- Pestaña 3: Vista de residente B (desde admin)
- ✅ Todas las pestañas funcionan independientemente

### Escenario 2: Testing con múltiples roles
- Pestaña 1: Login como admin
- Pestaña 2: Login como residente
- ✅ Ambas sesiones coexisten sin conflicto

### Escenario 3: Ventana de incógnito
- Ventana normal: Usuario A
- Ventana incógnito: Usuario B
- ✅ Sesiones completamente separadas

## Notas Técnicas

- **sessionStorage** se borra cuando se cierra la pestaña/ventana
- **localStorage** persiste incluso después de cerrar el navegador
- Cada pestaña genera un Tab ID único basado en timestamp y random
- El sistema es retrocompatible con código legacy que use localStorage directamente

## Archivos Modificados

- `frontend/src/utils/sessionManager.js` (NUEVO)
- `frontend/src/components/PageLogin.jsx`
- `frontend/src/components/PageAdmin.jsx`
- `frontend/src/components/PageResidente.jsx`
- `frontend/src/components/PageEditarUsuario.jsx`
- `frontend/src/components/PageActualizarInfo.jsx`

## Migración desde Sistema Anterior

El sistema anterior usaba:
```javascript
// ❌ Antiguo
localStorage.getItem('token')
localStorage.getItem('Usuario')
```

Ahora se debe usar:
```javascript
// ✅ Nuevo
import { getToken, getUsuario } from '../utils/sessionManager';
const token = getToken();
const usuario = getUsuario();
```

No es necesario cambiar código existente de forma inmediata. El sessionManager funciona como fallback usando localStorage si no hay datos en sessionStorage.
