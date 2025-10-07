# Finnwey 📱💰

**Finnwey** es una aplicación móvil de finanzas personales desarrollada con React Native y Expo, diseñada para ayudar a los usuarios a gestionar sus finanzas, establecer metas de ahorro y realizar un seguimiento de sus transacciones de manera intuitiva y segura.

## 🚀 Características Principales

### 💳 Gestión Financiera
- **Dashboard Personalizado**: Vista general de finanzas con resumen de saldo, ingresos y gastos
- **Transacciones**: Registro y seguimiento de todas las transacciones financieras
- **Metas de Ahorro**: Establecimiento y seguimiento de objetivos financieros
- **Presupuesto**: Control de gastos por categorías

### 🔐 Seguridad y Autenticación
- **Autenticación Biométrica**: Soporte para Face ID y Touch ID
- **PIN de Seguridad**: Código PIN personalizable para acceso
- **Verificación por SMS**: Proceso de verificación de dos factores
- **Recuperación de Contraseña**: Sistema seguro de recuperación

### 📊 Análisis y Reportes
- **Reportes Financieros**: Análisis detallado de gastos e ingresos
- **Gráficos Interactivos**: Visualización de datos financieros
- **Exportación de Datos**: Descarga de reportes en diferentes formatos

### 📱 Funcionalidades Adicionales
- **Escáner de Documentos**: Escaneo de recibos y documentos financieros
- **Configuraciones Personalizables**: Personalización de la interfaz y preferencias
- **Notificaciones**: Alertas para pagos programados y metas

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** (0.76.7) - Framework principal
- **Expo** (52.0.38) - Plataforma de desarrollo
- **TypeScript** (5.3.3) - Tipado estático
- **NativeWind** (4.1.23) - Estilos con Tailwind CSS
- **React Hook Form** (7.54.2) - Manejo de formularios
- **Zod** (3.24.2) - Validación de esquemas

### Navegación y UI
- **Expo Router** (4.0.19) - Navegación basada en archivos
- **React Navigation** - Navegación entre pantallas
- **Expo Vector Icons** - Iconografía
- **Victory Native** (37.3.6) - Gráficos y visualizaciones
- **React Native Reanimated** - Animaciones fluidas

### Estado y Datos
- **Zustand** (5.0.3) - Gestión de estado global
- **Supabase** (2.49.4) - Backend como servicio
- **AsyncStorage** - Almacenamiento local
- **Expo Secure Store** - Almacenamiento seguro

### Funcionalidades Especiales
- **Expo Camera** - Funcionalidad de cámara
- **Expo Local Authentication** - Autenticación biométrica
- **React Native Document Scanner** - Escaneo de documentos
- **Expo Haptics** - Retroalimentación táctil

## 📁 Estructura del Proyecto

```
finnwey/
├── app/                          # Navegación principal (Expo Router)
│   ├── _layout.tsx              # Layout raíz
│   ├── index.tsx                # Pantalla de inicio
│   ├── (auth)/                  # Rutas de autenticación
│   │   ├── _layout.tsx
│   │   ├── onboarding/          # Flujo de onboarding
│   │   │   ├── country.tsx
│   │   │   ├── phone.tsx
│   │   │   ├── pin.tsx
│   │   │   ├── signup.tsx
│   │   │   └── verify.tsx
│   │   ├── recover-password.tsx
│   │   └── register.tsx
│   ├── (protected)/             # Rutas protegidas
│   │   ├── _layout.tsx
│   │   └── (tabs)/              # Navegación por pestañas
│   │       ├── _layout.tsx
│   │       ├── dashboard/       # Dashboard principal
│   │       ├── card/            # Gestión de tarjetas
│   │       ├── report/          # Reportes y análisis
│   │       ├── scan/            # Escáner de documentos
│   │       └── settings/        # Configuraciones
│   ├── components/              # Componentes específicos de la app
│   │   ├── camera/              # Componentes de cámara
│   │   └── dashboard/           # Componentes del dashboard
│   └── lib/                     # Utilidades y configuraciones
│       └── supabase.ts          # Configuración de Supabase
├── components/                   # Componentes reutilizables
│   ├── common/                  # Componentes básicos
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   └── ui/                      # Componentes de UI
├── store/                       # Gestión de estado (Zustand)
│   ├── app.store.ts             # Estado general de la app
│   ├── auth.store.ts            # Estado de autenticación
│   ├── finance.store.ts         # Estado financiero
│   ├── goal.store.ts            # Estado de metas
│   ├── onboarding.store.ts      # Estado de onboarding
│   ├── theme.store.ts           # Estado del tema
│   └── index.ts                 # Exportaciones centralizadas
├── constants/                   # Constantes de la aplicación
│   └── Colors.ts                # Paleta de colores
├── hooks/                       # Hooks personalizados
├── assets/                      # Recursos estáticos
│   ├── fonts/                   # Fuentes personalizadas
│   └── images/                  # Imágenes e iconos
└── scripts/                     # Scripts de utilidad
    └── reset-project.js         # Script de reinicio del proyecto
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (para desarrollo en iOS)
- Android Studio (para desarrollo en Android)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd finnwey
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Crear un archivo `.env` en la raíz del proyecto
   - Configurar las credenciales de Supabase:
     ```
     EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
     EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
     ```

4. **Iniciar el proyecto**
   ```bash
   npm start
   ```

### Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS
- `npm run web` - Ejecuta en web
- `npm run reset-project` - Reinicia el proyecto
- `npm test` - Ejecuta las pruebas
- `npm run lint` - Ejecuta el linter

## 🔧 Configuración de Supabase

Para que la aplicación funcione correctamente, necesitas configurar Supabase:

1. Crear una cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Configurar las siguientes tablas en la base de datos:
   - `users` - Información de usuarios
   - `transactions` - Transacciones financieras
   - `goals` - Metas de ahorro
   - `categories` - Categorías de gastos

4. Configurar las políticas de seguridad (RLS)
5. Actualizar las credenciales en `app/lib/supabase.ts`

## 📱 Funcionalidades por Sección

### 🔐 Autenticación (`(auth)/`)
- **Onboarding**: Guía inicial para nuevos usuarios
- **Registro**: Creación de cuenta con verificación
- **Inicio de Sesión**: Autenticación con PIN y biométricos
- **Recuperación**: Recuperación segura de contraseña

### 📊 Dashboard (`(protected)/(tabs)/dashboard/`)
- **Resumen Financiero**: Vista general de saldos y movimientos
- **Transacciones Recientes**: Lista de últimas operaciones
- **Metas de Ahorro**: Progreso de objetivos financieros
- **Pagos Programados**: Recordatorios de pagos futuros

### 📈 Reportes (`(protected)/(tabs)/report/`)
- **Análisis de Gastos**: Desglose por categorías
- **Gráficos Interactivos**: Visualización de tendencias
- **Exportación**: Descarga de reportes
- **Filtros Avanzados**: Búsqueda y filtrado de datos

### ⚙️ Configuraciones (`(protected)/(tabs)/settings/`)
- **Perfil de Usuario**: Información personal
- **Seguridad**: Configuración de PIN y biométricos
- **Notificaciones**: Preferencias de alertas
- **Tema**: Personalización de la interfaz

## 🎨 Diseño y UX

La aplicación utiliza un diseño moderno y minimalista con:
- **Paleta de Colores**: Azul corporativo (#1e3a8a) con acentos
- **Tipografía**: Inter como fuente principal
- **Iconografía**: Iconos consistentes y reconocibles
- **Animaciones**: Transiciones fluidas y feedback táctil
- **Accesibilidad**: Soporte para lectores de pantalla

## 🔒 Seguridad

- **Autenticación Biométrica**: Face ID y Touch ID
- **Almacenamiento Seguro**: Datos sensibles encriptados
- **Validación de Entrada**: Verificación de datos con Zod
- **Políticas de Privacidad**: Cumplimiento con regulaciones

## 🧪 Testing

El proyecto incluye configuración para testing con Jest:
- Pruebas unitarias para componentes
- Snapshots para UI
- Configuración de testing para React Native

## 📦 Despliegue

### iOS
1. Configurar certificados de desarrollo
2. Ejecutar `expo build:ios`
3. Subir a App Store Connect

### Android
1. Configurar keystore de producción
2. Ejecutar `expo build:android`
3. Subir a Google Play Console

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de Expo y React Native

---

**Finnwey** - Tu compañero financiero personal 💰✨
