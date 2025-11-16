import { View, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProfileSection from './components/ProfileSection'
import CustomizeSection from './components/CustomizeSection'
import SettingsGroup from './components/SettingsGroup'
import SettingsOption from './components/SettingsOption'
import ThemeToggle from './components/ThemeToggle'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'
import { DebugUserInfo } from '@/components/common/DebugUserInfo'

export default function SettingsScreen() {
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout()
            router.replace('/')
          } catch (error) {
            console.error('Error al cerrar sesión:', error)
            Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="pb-24">
        <ProfileSection name={user?.full_name || 'Usuario'} email={user?.email || ''} />

        {/* <CustomizeSection onPress={() => {}} /> */}

        <View className="px-4">
          <SettingsGroup title="APARIENCIA">
            <ThemeToggle />
          </SettingsGroup>

          <SettingsGroup title="CONFIGURACIÓN PRINCIPAL">
            <SettingsOption icon="person-outline" title="Administrar Cuentas" onPress={() => {}} />
            <SettingsOption icon="lock-closed-outline" title="Autenticación de Dos Factores" onPress={() => {}} disabled />
            <SettingsOption icon="card-outline" title="Cuentas Bancarias Vinculadas" onPress={() => {}} disabled />
            <SettingsOption icon="star-outline" title="Plan de Suscripción" badgeText="Plan Gratuito" showBadge onPress={() => router.push('/settings/subscription')} />
          </SettingsGroup>

          <SettingsGroup title="PREFERENCIAS DE NOTIFICACIONES">
            <SettingsOption icon="notifications-outline" title="Alertas de Transacciones" onPress={() => {}} disabled />
            <SettingsOption icon="calendar-outline" title="Recordatorios de Presupuesto" onPress={() => {}} disabled />
          </SettingsGroup>

          <SettingsGroup title="PRESUPUESTO Y METAS">
            <SettingsOption icon="wallet-outline" title="Establecer Límites de Gastos" onPress={() => {}} disabled />
            <SettingsOption icon="trending-up-outline" title="Crear Metas Financieras" onPress={() => {}} disabled />
          </SettingsGroup>

          <SettingsGroup title="CUENTA">
            <SettingsOption icon="log-out-outline" title="Cerrar Sesión" subtitle="Salir de tu cuenta actual" onPress={handleLogout} destructive />
          </SettingsGroup>

          <SettingsGroup title="SOPORTE Y COMENTARIOS">
            <SettingsOption icon="help-circle-outline" title="Centro de Ayuda" onPress={() => router.push('/settings/help')} />
          </SettingsGroup>
        </View>
      </ScrollView>

      {/* Componente de debug - solo visible en desarrollo */}
      <DebugUserInfo />
    </SafeAreaView>
  )
}
