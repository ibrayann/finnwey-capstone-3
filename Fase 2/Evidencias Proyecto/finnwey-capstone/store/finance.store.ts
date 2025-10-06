import { create } from 'zustand'

export interface Transaction {
  id: string
  amount: number
  title: string
  description: string
  type: 'income' | 'expense'
  category: string
  subcategory: string
  date: Date
  notes?: string
  hasReceipt: boolean
  receiptImage?: string
  isRecurring: boolean
  icon?: string
}

interface FinanceState {
  balance: number
  transferLimit: number
  spent: number
  income: number
  spending: number
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
}

export const useFinanceStore = create<FinanceState>((set) => ({
  balance: 243320.0,
  transferLimit: 8920.0,
  spent: 5200.0,
  income: 2450002,
  spending: 1520228,
  transactions: [
    {
      id: '1',
      amount: 25000,
      title: 'Freepik Premium',
      description: 'Suscripción anual de Freepik Premium para recursos de diseño',
      type: 'expense',
      category: 'entertainment',
      subcategory: 'Streaming',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
      notes: 'Suscripción renovada automáticamente',
      hasReceipt: true,
      isRecurring: true,
      icon: '👑',
    },
    {
      id: '2',
      amount: 2450000,
      title: 'Salario Mensual',
      description: 'Salario del mes de enero 2025',
      type: 'income',
      category: 'income',
      subcategory: 'Salario',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
      notes: 'Pago por nómina bancaria',
      hasReceipt: false,
      isRecurring: true,
      icon: '💰',
    },
    {
      id: '3',
      amount: 15890,
      title: 'Farmacia Ahumada',
      description: 'Compra de medicamentos y productos de farmacia',
      type: 'expense',
      category: 'health',
      subcategory: 'Farmacia',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
      notes: 'Paracetamol, vitamina C y jabón antibacterial',
      hasReceipt: true,
      isRecurring: false,
      icon: '⚕️',
    },
  ],
  addTransaction: (transaction) =>
    set((state) => {
      const newTransaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date(),
      }

      // Actualizar balance basado en el tipo de transacción
      const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount
      const newBalance = state.balance + balanceChange

      // Actualizar gastos o ingresos según el tipo
      const newSpending = transaction.type === 'expense' ? state.spending + transaction.amount : state.spending
      const newIncome = transaction.type === 'income' ? state.income + transaction.amount : state.income

      return {
        transactions: [newTransaction, ...state.transactions],
        balance: newBalance,
        spending: newSpending,
        income: newIncome,
      }
    }),
}))
