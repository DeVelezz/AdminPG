# 📋 Instrucciones para conectar PageAdmin con Base de Datos

## 🚀 Componente PageAdmin - Listo para Base de Datos

El componente `PageAdmin.jsx` ha sido refactorizado y está preparado para conectarse con una base de datos real. Actualmente usa datos de ejemplo (mock data) pero está estructurado para una fácil migración.

## 🔧 Cambios realizados:

### ✅ Estados agregados:
- `users`: Array para almacenar usuarios de la BD
- `loading`: Estado de carga
- `error`: Manejo de errores
- `selectedUsers`: Usuarios seleccionados para acciones masivas

### ✅ Funciones implementadas:
- `loadUsers()`: Carga usuarios desde la API
- `handleDeleteSelected()`: Eliminación masiva con confirmación
- `handleEditUser()`: Edición individual de usuarios
- `getStatusColor()`: Colores dinámicos según estado

### ✅ Interfaz mejorada:
- Tabla dinámica que renderiza datos desde el estado
- Estados de carga y error
- Confirmaciones con SweetAlert2
- Selección múltiple de usuarios
- Botón de reintentar en caso de error

## 🔗 Para conectar con la base de datos:

### 1. En `loadUsers()` (línea ~67):
```javascript
// DESCOMENTA estas líneas:
const data = await useService.getUsers();
setUsers(data);

// COMENTA/ELIMINA estas líneas:
setTimeout(() => {
    setUsers(mockUsers);
    setLoading(false);
}, 500);
```

### 2. En `handleDeleteSelected()` (línea ~117):
```javascript
// DESCOMENTA estas líneas:
for (const userId of selectedUsers) {
    await useService.deleteUser(userId);
}

// COMENTA/ELIMINA esta línea:
setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
```

### 3. En `handleEditUser()` (línea ~175):
```javascript
// DESCOMENTA esta línea:
window.location.href = `/editar-usuario/${userId}`;

// COMENTA/ELIMINA el Swal.fire de prueba
```

### 4. Eliminar datos mock:
- Elimina el array `mockUsers` (líneas 9-37)
- Ya no será necesario

## 📋 Estructura esperada de la API:

### GET /api/usuarios
**Respuesta esperada:**
```javascript
[
    {
        id: "001",
        nombre: "Juan Pérez", 
        email: "juan@email.com",
        torre: "Torre 1",
        apartamento: "101",
        estado: "Activo", // "Activo" | "En mora" | "Por vencer"
        telefono: "3001234567",
        propiedad_id: 1
    }
    // ... más usuarios
]
```

### DELETE /api/usuarios/:id
**Respuesta esperada:**
```javascript
{
    message: "Usuario eliminado exitosamente"
}
```

## 🎨 Estados de usuario soportados:
- **"Activo"**: Verde (bg-green-100 text-green-700)
- **"En mora"**: Rojo (bg-red-100 text-red-700) 
- **"Por vencer"**: Amarillo (bg-yellow-100 text-yellow-700)
- **Otros**: Gris (bg-gray-100 text-gray-700)

## 🔧 Servicios requeridos en useService.js:

Asegúrate de que `useService.js` tenga implementados:
- `getUsers()`: Obtener todos los usuarios
- `deleteUser(id)`: Eliminar usuario por ID

## 📱 Rutas adicionales a crear:
- `/editar-usuario/:id` - Página de edición de usuario
- `/actualizar` - Página de editar perfil del admin
- `/mora` - Página de usuarios en mora

## 🚀 Funcionalidades actuales:
- ✅ Carga de usuarios con estado de loading
- ✅ Manejo de errores con retry
- ✅ Selección múltiple de filas
- ✅ Eliminación masiva con confirmación
- ✅ Edición individual
- ✅ Estados visuales dinámicos
- ✅ Responsive design
- ✅ Alertas con SweetAlert2

El componente está completamente funcional con datos mock y listo para producción cuando conectes la base de datos real.