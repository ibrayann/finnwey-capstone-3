export { default as Header } from './Header'
export { default as FinancialOverview } from './FinancialOverview'
export { default as WalletSummary } from './WalletSummary'
export { default as LatestTransactions } from './LatestTransactions'
export { default as Circles } from './Circles'
export { default as ScheduledPayments } from './ScheduledPayments'
export { default as BudgetWidget } from '../../features/budgets/components/BudgetWidget'
export { default as AddMoneyModal } from './AddMoneyModal'
export { default as EditGoalModal } from './EditGoalModal'
export { default as EditTransactionModal } from './EditTransactionModal'
export { default as ContributionsHistory } from './ContributionsHistory'
export { default as SavingsDetailTabs } from './SavingsDetailTabs'
export { default as TransactionDetailTabs } from './TransactionDetailTabs'
export { CompleteInfoCard } from '@/components/dashboard/CompleteInfoCard'

// Exportación por defecto para evitar el warning de Expo Router
export default function DashboardComponents() {
  return null
}
