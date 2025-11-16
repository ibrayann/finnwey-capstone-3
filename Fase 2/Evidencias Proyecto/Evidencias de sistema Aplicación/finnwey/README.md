# Finnwey 💰📱

> **Aplicación móvil de gestión financiera personal** desarrollada con React Native, Expo y Supabase. Ayuda a los usuarios a controlar sus finanzas, establecer metas de ahorro, gestionar presupuestos y tomar decisiones financieras inteligentes.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.7-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49.4-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Uso](#-uso)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Arquitectura](#-arquitectura)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características

### 💳 Gestión Financiera Completa

- **Dashboard Personalizado**: Vista general con resumen financiero, saldo actual, ingresos y gastos del mes
- **Transacciones**: Registro, edición y seguimiento completo de todas las transacciones financieras
- **Categorización Inteligente**: Organización automática de transacciones por categorías personalizables
- **Historial Detallado**: Búsqueda y filtrado avanzado de transacciones históricas

### 🎯 Presupuestos y Metas

- **Presupuestos por Categoría**: Control de gastos con límites configurables por categoría
- **Seguimiento en Tiempo Real**: Monitoreo del progreso de presupuestos con alertas visuales
- **Metas de Ahorro**: Establecimiento y seguimiento de objetivos financieros con contribuciones programadas
- **Análisis de Progreso**: Visualización del avance hacia metas con gráficos interactivos

### 🤖 Inteligencia Artificial

- **Tips Financieros Personalizados**: Recomendaciones inteligentes basadas en el comportamiento financiero del usuario
- **Análisis con IA**: Insights generados por Google Gemini AI sobre presupuestos, gastos y metas
- **Priorización Automática**: Sugerencias ordenadas por urgencia e importancia financiera

### 📊 Reportes y Análisis

- **Reportes Financieros**: Análisis detallado de ingresos, gastos y tendencias
- **Gráficos Interactivos**: Visualización de datos con Victory Native
- **Exportación de Datos**: Descarga de reportes en diferentes formatos
- **KPIs Mensuales**: Indicadores clave de rendimiento financiero

### 🔐 Seguridad y Autenticación

- **Autenticación Biométrica**: Soporte para Face ID (iOS) y Touch ID / Huella Digital (Android)
- **PIN de Seguridad**: Código PIN personalizable para acceso rápido
- **Verificación por Email/SMS**: Proceso de verificación de dos factores
- **Almacenamiento Seguro**: Datos sensibles encriptados con Expo Secure Store
- **Row Level Security (RLS)**: Políticas de seguridad a nivel de base de datos

### 📱 Funcionalidades Adicionales

- **Escáner de Recibos**: Escaneo de documentos y recibos con OCR
- **Cámara Integrada**: Captura de imágenes para transacciones
- **Onboarding Completo**: Guía paso a paso para nuevos usuarios
- **Perfil Personalizable**: Configuración de información personal y preferencias
- **Notificaciones**: Alertas para pagos programados y recordatorios de metas
- **Modo Oscuro**: Soporte completo para tema claro y oscuro
- **Pagos Programados**: Gestión de pagos recurrentes y recordatorios

---

## 🛠️ Tecnologías

### Core Framework

- **[React Native](https://reactnative.dev/)** `0.81.4` - Framework para desarrollo móvil multiplataforma
- **[Expo](https://expo.dev/)** `54.0.7` - Plataforma y herramientas de desarrollo
- **[TypeScript](https://www.typescriptlang.org/)** `5.9.2` - Tipado estático para mayor seguridad
- **[Expo Router](https://expo.github.io/router/)** `6.0.4` - Navegación basada en archivos

### Estilos y UI

- **[NativeWind](https://www.nativewind.dev/)** `4.1.23` - Tailwind CSS para React Native
- **[Tailwind CSS](https://tailwindcss.com/)** `3.4.17` - Framework de utilidades CSS
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** `4.1.0` - Animaciones de alto rendimiento
- **[React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)** `2.28.0` - Gestos nativos
- **[Victory Native](https://formidable.com/open-source/victory/)** `37.3.6` - Gráficos y visualizaciones
- **[Expo Vector Icons](https://docs.expo.dev/guides/icons/)** `15.0.2` - Iconografía

### Estado y Datos

- **[Zustand](https://zustand-demo.pmnd.rs/)** `5.0.3` - Gestión de estado global ligera
- **[TanStack Query](https://tanstack.com/query)** `5.90.2` - Gestión de estado del servidor y caché
- **[Supabase](https://supabase.com/)** `2.49.4` - Backend como servicio (BaaS)
  - Base de datos PostgreSQL
  - Autenticación
  - Almacenamiento
  - Edge Functions
  - Realtime subscriptions

### Formularios y Validación

- **[React Hook Form](https://react-hook-form.com/)** `7.54.2` - Manejo eficiente de formularios
- **[Zod](https://zod.dev/)** `3.24.2` - Validación de esquemas TypeScript-first
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** `4.1.3` - Resolvers para validación

### Funcionalidades Nativas

- **[Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)** `17.0.7` - Acceso a la cámara
- **[Expo Local Authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)** `17.0.7` - Autenticación biométrica
- **[Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)** `15.0.7` - Almacenamiento seguro
- **[Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)** `15.0.7` - Retroalimentación táctil
- **[React Native Document Scanner](https://github.com/michaelmng/react-native-document-scanner-plugin)** `1.0.1` - Escaneo de documentos

### Utilidades

- **[React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)** `5.6.0` - Manejo de áreas seguras
- **[React Native Toast Message](https://github.com/calintamas/react-native-toast-message)** `2.2.1` - Notificaciones toast
- **[Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)** `18.0.8` - Constantes del sistema
- **[Expo Font](https://docs.expo.dev/versions/latest/sdk/font/)** `14.0.8` - Carga de fuentes personalizadas

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**

### Para desarrollo iOS:

- **macOS** (recomendado)
- **Xcode** >= 14.0
- **CocoaPods** (`sudo gem install cocoapods`)
- **iOS Simulator** (incluido con Xcode)

### Para desarrollo Android:

- **Android Studio**
- **Android SDK** (API Level 33+)
- **Android Emulator** o dispositivo físico con modo desarrollador activado

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd finnwey
```

### 2. Instalar dependencias

```bash
npm install
```

o con yarn:

```bash
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (opcional, ya que las credenciales están en `app.json`):

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

**Nota**: Las credenciales también pueden configurarse en `app.json` en la sección `extra`.

### 4. Iniciar el proyecto

```bash
npm start
```

Esto abrirá Expo DevTools en tu navegador. Puedes:

- Presionar `i` para abrir en iOS Simulator
- Presionar `a` para abrir en Android Emulator
- Escanear el código QR con la app Expo Go en tu dispositivo físico

---

## ⚙️ Configuración

### Configuración de Supabase

1. **Crear cuenta y proyecto en Supabase**
   - Visita [supabase.com](https://supabase.com)
   - Crea una cuenta (si no tienes una)
   - Crea un nuevo proyecto

2. **Configurar la base de datos**
   - Ejecuta el script SQL de inicialización (`DBFinnweyV1.sql`) en el SQL Editor de Supabase
   - Esto creará todas las tablas necesarias:
     - `users` - Información de usuarios
     - `transactions` - Transacciones financieras
     - `budgets` - Presupuestos por categoría
     - `budget_alerts` - Alertas de presupuesto
     - `goals` - Metas de ahorro
     - `goal_contributions` - Contribuciones a metas
     - `categories` - Categorías de gastos
     - `financial_tips` - Tips financieros generados por IA
     - Y más...

3. **Configurar Row Level Security (RLS)**
   - Activa RLS en todas las tablas
   - Configura políticas de seguridad según tus necesidades
   - Asegúrate de que los usuarios solo puedan acceder a sus propios datos

4. **Configurar Edge Functions (Opcional)**
   - Para tips financieros con IA, despliega la Edge Function `swift-endpoint`
   - Configura la variable de entorno `GOOGLE_API_KEY` en Supabase
   - Ver documentación en `docs/financial-tip-edge-function.md`

5. **Obtener credenciales**
   - Ve a **Settings** > **API** en tu proyecto de Supabase
   - Copia la **URL** y la **anon key**
   - Actualiza `lib/supabase.ts` o `app.json` con estas credenciales

### Configuración de Google Gemini AI (Opcional)

Para habilitar los tips financieros con IA:

1. Obtén una API key de Google Gemini
2. Configúrala como variable de entorno en Supabase Edge Functions:
   - Ve a **Edge Functions** > **Settings**
   - Agrega `GOOGLE_API_KEY` con tu clave

---

## 📁 Estructura del Proyecto

```
finnwey/
├── app/                              # Navegación principal (Expo Router)
│   ├── _layout.tsx                  # Layout raíz de la aplicación
│   ├── index.tsx                     # Pantalla de bienvenida/inicio
│   ├── (auth)/                       # Grupo de rutas de autenticación
│   │   ├── _layout.tsx               # Layout de autenticación
│   │   └── onboarding/              # Flujo de onboarding
│   │       ├── signup.tsx           # Registro de usuario
│   │       ├── verify.tsx           # Verificación de código
│   │       ├── email-verify.tsx     # Verificación de email
│   │       ├── phone.tsx            # Número de teléfono
│   │       ├── country.tsx          # Selección de país
│   │       ├── region.tsx           # Selección de región
│   │       ├── city.tsx             # Selección de ciudad
│   │       ├── gender.tsx           # Selección de género
│   │       └── notifications.tsx    # Configuración de notificaciones
│   └── (protected)/                  # Rutas protegidas (requieren autenticación)
│       ├── _layout.tsx              # Layout de rutas protegidas
│       ├── complete-profile/        # Completar perfil
│       │   ├── phase-1.tsx
│       │   ├── phase-2.tsx
│       │   └── phase-3.tsx
│       └── (tabs)/                   # Navegación por pestañas
│           ├── _layout.tsx          # Layout de tabs
│           ├── dashboard/           # Dashboard principal
│           │   ├── index.tsx        # Vista principal del dashboard
│           │   ├── budget/           # Gestión de presupuestos
│           │   │   ├── index.tsx
│           │   │   ├── categories.tsx
│           │   │   └── detail.tsx
│           │   ├── savings/         # Gestión de metas de ahorro
│           │   │   ├── index.tsx
│           │   │   ├── all.tsx
│           │   │   ├── add-goal.tsx
│           │   │   └── detail.tsx
│           │   ├── transactions/   # Gestión de transacciones
│           │   │   ├── index.tsx
│           │   │   └── [id].tsx
│           │   ├── report/         # Reportes y análisis
│           │   │   └── index.tsx
│           │   ├── tips/           # Tips financieros con IA
│           │   │   └── index.tsx
│           │   └── add-transaction/ # Agregar transacción
│           │       └── index.tsx
│           ├── scan/                # Escáner de documentos
│           │   └── index.tsx
│           └── settings/            # Configuraciones
│               ├── index.tsx
│               ├── profile.tsx
│               ├── security.tsx
│               └── ...
│
├── components/                       # Componentes reutilizables
│   ├── common/                      # Componentes básicos
│   │   ├── Button.tsx               # Botón reutilizable
│   │   ├── Input.tsx                # Input de texto
│   │   ├── Modal.tsx                # Modal genérico
│   │   ├── ErrorModal.tsx            # Modal de errores
│   │   ├── NumericKeyboard.tsx      # Teclado numérico
│   │   └── ...
│   ├── dashboard/                   # Componentes del dashboard
│   │   ├── Header.tsx               # Encabezado del dashboard
│   │   ├── FinancialOverview.tsx  # Resumen financiero
│   │   ├── LatestTransactions.tsx  # Últimas transacciones
│   │   ├── WalletSummary.tsx        # Resumen de billetera
│   │   └── ...
│   └── camera/                      # Componentes de cámara
│       ├── CameraControls.tsx
│       ├── CameraFrame.tsx
│       └── ...
│
├── features/                         # Features organizados por dominio
│   ├── auth/                        # Autenticación
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── budgets/                     # Presupuestos
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── goals/                       # Metas de ahorro
│   │   ├── hooks/
│   │   └── services/
│   ├── transactions/                # Transacciones
│   │   ├── hooks/
│   │   └── services/
│   ├── financial-tips/              # Tips financieros con IA
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── receipt/                     # Escaneo de recibos
│   │   ├── hooks/
│   │   └── services/
│   ├── reports/                     # Reportes
│   │   ├── hooks/
│   │   └── services/
│   └── shared/                      # Utilidades compartidas
│       ├── hooks/
│       └── services/
│
├── store/                           # Estado global (Zustand)
│   ├── auth.store.ts                # Estado de autenticación
│   ├── finance.store.ts             # Estado financiero
│   ├── goal.store.ts                # Estado de metas
│   ├── budget.store.ts              # Estado de presupuestos
│   ├── onboarding.store.ts          # Estado de onboarding
│   ├── theme.store.ts               # Estado del tema
│   └── index.ts                     # Exportaciones centralizadas
│
├── lib/                             # Utilidades y configuraciones
│   ├── supabase.ts                 # Cliente de Supabase
│   └── query-client.ts              # Configuración de TanStack Query
│
├── providers/                       # Providers de React
│   ├── QueryProvider.tsx            # Provider de TanStack Query
│   └── ThemeProvider.tsx            # Provider de tema
│
├── types/                           # Tipos TypeScript
│   ├── budget.ts
│   ├── category.ts
│   ├── savings.ts
│   ├── receipt.ts
│   └── ...
│
├── constants/                       # Constantes
│   └── Colors.ts                    # Paleta de colores
│
├── assets/                          # Recursos estáticos
│   ├── fonts/                       # Fuentes personalizadas
│   └── images/                      # Imágenes e iconos
│
├── docs/                            # Documentación
│   └── financial-tip/              # Documentación de tips financieros
│
├── DBFinnweyV1.sql                  # Script SQL de inicialización
├── app.json                         # Configuración de Expo
├── package.json                     # Dependencias del proyecto
├── tsconfig.json                    # Configuración de TypeScript
├── tailwind.config.js              # Configuración de Tailwind
└── metro.config.js                  # Configuración de Metro bundler
```

---

## 💻 Uso

### Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en web
npm run web

# Ejecutar tests
npm test

# Ejecutar linter
npm run lint

# Reiniciar proyecto (limpiar caché)
npm run reset-project
```

### Flujo de Usuario

1. **Onboarding**: Nuevos usuarios completan el flujo de registro y configuración inicial
2. **Dashboard**: Vista principal con resumen financiero y acceso rápido a funciones
3. **Transacciones**: Agregar, editar y gestionar transacciones financieras
4. **Presupuestos**: Configurar y monitorear presupuestos por categoría
5. **Metas**: Establecer y contribuir a metas de ahorro
6. **Reportes**: Analizar gastos, ingresos y tendencias financieras
7. **Tips**: Recibir recomendaciones personalizadas basadas en IA

---

## 🔧 Desarrollo

### Convenciones de Código

- **TypeScript**: Todo el código debe estar tipado
- **Funcional Components**: Usar componentes funcionales con hooks
- **Named Exports**: Preferir exports nombrados sobre default exports
- **File Naming**: Usar PascalCase para componentes, camelCase para utilidades
- **Directory Naming**: Usar kebab-case para directorios

### Estructura de Features

Cada feature sigue esta estructura:

```
features/[feature-name]/
├── components/          # Componentes específicos del feature
├── hooks/              # Custom hooks (usando TanStack Query)
├── services/           # Servicios de API/Supabase
├── types/              # Tipos TypeScript específicos
├── index.ts            # Exports públicos
└── README.md           # Documentación del feature
```

### Gestión de Estado

- **Zustand**: Para estado global de la aplicación (auth, tema, etc.)
- **TanStack Query**: Para estado del servidor y caché de datos
- **React Context**: Solo para providers (Query, Theme)

### Estilos

- **NativeWind v4**: Sistema de estilos principal
- **Tailwind CSS**: Utilidades de diseño
- **Responsive**: Usar `useDeviceOrientation` y Flexbox
- **Dark Mode**: Soporte completo con `useColorScheme`

---

## 🚢 Despliegue

### Preparación

1. **Actualizar versión** en `app.json` y `package.json`
2. **Configurar credenciales** de producción en Supabase
3. **Revisar políticas RLS** en Supabase
4. **Probar en dispositivos físicos** antes de publicar

### iOS (App Store)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar EAS
eas build:configure

# Crear build de producción
eas build --platform ios --profile production

# O usar Expo Application Services
expo build:ios
```

### Android (Google Play)

```bash
# Crear build de producción
eas build --platform android --profile production

# O usar Expo Application Services
expo build:android
```

### Actualizaciones OTA (Over-The-Air)

```bash
# Publicar actualización
eas update --branch production --message "Descripción de la actualización"
```

---

## 🏗️ Arquitectura

### Patrón de Arquitectura

Finnwey sigue una **arquitectura basada en features** con separación clara de responsabilidades:

- **Presentación**: Componentes React en `app/` y `components/`
- **Lógica de Negocio**: Hooks y servicios en `features/`
- **Estado Global**: Stores de Zustand en `store/`
- **Estado del Servidor**: TanStack Query hooks en `features/*/hooks/`
- **Backend**: Supabase (Base de datos, Auth, Storage, Edge Functions)

### Flujo de Datos

```
Usuario → Componente → Hook (TanStack Query) → Servicio → Supabase
                ↓
         Store (Zustand) ← Cache (TanStack Query)
```

### Seguridad

- **Autenticación**: Supabase Auth con JWT
- **Almacenamiento**: Expo Secure Store para tokens
- **RLS**: Row Level Security en todas las tablas
- **Validación**: Zod para validación de esquemas
- **Biometría**: Expo Local Authentication

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Guías de Contribución

- Sigue las convenciones de código establecidas
- Escribe tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Mantén los commits descriptivos y atómicos

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 📞 Soporte

Para soporte técnico o preguntas:

- 📧 Crear un issue en GitHub
- 📚 Revisar la documentación de [Expo](https://docs.expo.dev/)
- 📚 Revisar la documentación de [React Native](https://reactnative.dev/)
- 📚 Revisar la documentación de [Supabase](https://supabase.com/docs)

---

## 🙏 Agradecimientos

- [Expo](https://expo.dev/) por la excelente plataforma de desarrollo
- [Supabase](https://supabase.com/) por el backend como servicio
- [React Native](https://reactnative.dev/) por el framework
- Todos los mantenedores de las librerías de código abierto utilizadas

---

<div align="center">

**Finnwey** - Tu compañero financiero personal 💰✨

Desarrollado con ❤️ usando React Native, Expo y Supabase

</div>
