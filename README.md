# 🏢 AdminPG - Sistema de Administración y Cobros

Sistema completo de administración para conjuntos residenciales con gestión de mora, pagos y residentes.

## 🚀 Características Principales

### 👥 Gestión de Usuarios
- **Portal de Residentes**: Interface personalizada para consulta de pagos
- **Panel de Administración**: Herramientas completas para administradores
- **Sistema de Autenticación**: Login seguro con JWT

### 💰 Sistema de Cobros
- **Gestión de Mora**: Cálculo automático de días en mora y deudas
- **Múltiples Métodos de Pago**: Tarjeta, PSE, Nequi, Bancolombia, Transferencias
- **Registro de Pagos**: Sistema completo para administradores
- **Estados Dinámicos**: Colores automáticos según estado de pagos

### 🎨 Interface de Usuario
- **Diseño Responsivo**: Optimizado para desktop y móvil
- **UI/UX Moderna**: Diseño profesional con Tailwind CSS
- **Navegación Inteligente**: Flujo optimizado entre secciones
- **Saludos Personalizados**: Bienvenida personalizada por género

## 🛠️ Tecnologías

### Frontend
- **React 19.1.0** - Framework principal
- **Tailwind CSS 4.1.10** - Estilos y diseño
- **React Router DOM 7.6.3** - Navegación
- **React Icons 5.5.0** - Iconografía
- **SweetAlert2** - Alertas elegantes
- **Vite 6.3.5** - Build tool

### Backend
- **Node.js + Express 5.1.0** - Servidor web
- **Sequelize 6.37.7** - ORM para base de datos
- **MySQL2** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas

## 📁 Estructura del Proyecto

```
AdminPG-mejoras/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── PageResidente.jsx    # Portal del residente
│   │   │   ├── PageMora.jsx         # Gestión de mora
│   │   │   ├── PageAdmin.jsx        # Panel admin
│   │   │   └── ...
│   │   ├── services/        # Servicios y API calls
│   │   └── assets/          # Recursos estáticos
│   ├── public/              # Archivos públicos
│   └── package.json
│
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas de API
│   │   ├── middlewares/     # Middlewares
│   │   └── config/          # Configuración DB
│   └── package.json
│
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MySQL/MariaDB
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jpvlz/AdminPG-mejoras.git
cd AdminPG-mejoras
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta backend:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=adminpg_db
JWT_SECRET=tu_jwt_secret
PORT=3000
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
```

### 4. Ejecutar la aplicación

**Backend:**
```bash
cd backend
npm start
# Servidor corriendo en http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Aplicación corriendo en http://localhost:5173
```

## 🎯 Funcionalidades Destacadas

### 🏠 Portal del Residente
- ✅ Consulta de estado de pagos
- ✅ Visualización de servicios pendientes
- ✅ Modal de pago con múltiples opciones
- ✅ Saludo personalizado por género
- ✅ Interface responsive y moderna

### 👨‍💼 Panel de Administración
- ✅ Gestión completa de mora
- ✅ Registro de pagos recibidos
- ✅ Vista detallada de cada residente
- ✅ Navegación inteligente entre secciones
- ✅ Cálculos automáticos de deuda y mora

### 🎨 Sistema de UI/UX
- ✅ Colores dinámicos según estado
- ✅ Subrayado inteligente en nombres
- ✅ Badges con colores intensos
- ✅ Layout optimizado para información
- ✅ Transiciones suaves

## 📱 Capturas de Pantalla

### Portal del Residente
![Portal Residente](docs/screenshots/portal-residente.png)

### Panel de Administración
![Panel Admin](docs/screenshots/panel-admin.png)

### Gestión de Mora
![Gestión Mora](docs/screenshots/gestion-mora.png)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Jpvlz** - [GitHub](https://github.com/Jpvlz)

## 🙏 Agradecimientos

- Proyecto desarrollado para SENA
- Sistema diseñado para conjuntos residenciales
- Interface optimizada para administración eficiente

---

⭐ ¡Si te gusta este proyecto, dale una estrella en GitHub! ⭐