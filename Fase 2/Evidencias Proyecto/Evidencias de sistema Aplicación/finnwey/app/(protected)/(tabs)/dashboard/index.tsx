import { View, ScrollView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import FinancialOverview from '@/components/dashboard/FinancialOverview'
import WalletSummary from '@/components/dashboard/WalletSummary'
import LatestTransactions from '@/components/dashboard/LatestTransactions'
// import Circles from '@/components/dashboard/Circles'
// import ScheduledPayments from '@/components/dashboard/ScheduledPayments'
import BudgetWidget from '@/features/budgets/components/BudgetWidget'
import { CompleteInfoCard } from '@/components/dashboard/CompleteInfoCard'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/features/shared/hooks/useTheme'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'

export default function Dashboard() {
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const { profile, loadProfile } = useAuthStore()

  // Cargar perfil al montar el componente
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleCompleteProfile = () => {
    router.push('/complete-profile/phase-1')
  }

  // Ocultar el card si las preferencias están completadas
  const shouldShowCompleteCard = !profile?.preferences_completed

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        edges={['top']}
        style={{
          flex: 0,
          backgroundColor: isDarkMode ? '#14532d' : '#166534',
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? '#16a34a' : '#fff',
        }}
      >
        <ScrollView bounces={false} overScrollMode="never" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={isDarkMode ? ['#14532d', '#16a34a'] : ['#166534', '#22c55e']} style={{ minHeight: Platform.OS === 'ios' ? 220 : 200 }}>
            <Header />
            <FinancialOverview />
          </LinearGradient>
          <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl min-h-[500px]`}>
            {shouldShowCompleteCard && <CompleteInfoCard onPress={handleCompleteProfile} />}
            <WalletSummary />
            <BudgetWidget />
            <LatestTransactions />
            {/* <Circles /> */}
            {/* <ScheduledPayments /> */}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
