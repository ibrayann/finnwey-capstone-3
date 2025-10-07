import { create } from 'zustand'
import { Ionicons } from '@expo/vector-icons'

export interface SavingGoal {
  id: string
  name: string
  icon: keyof typeof Ionicons.glyphMap
  current: number
  target: number
  daysLeft: number
  date?: string
  createdAt: Date
}

interface GoalState {
  goals: SavingGoal[]
  selectedGoals: string[]
  isSelectionMode: boolean
  addGoal: (goal: Omit<SavingGoal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, goal: Partial<SavingGoal>) => void
  deleteGoal: (id: string) => void
  toggleSelectionMode: () => void
  toggleGoalSelection: (id: string) => void
  selectAllGoals: () => void
  clearSelection: () => void
  deleteSelectedGoals: () => void
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [
    {
      id: '1',
      name: 'Fondo de Emergencia',
      icon: 'warning-outline',
      current: 4000,
      target: 5000,
      daysLeft: 22,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Fondo de Viaje',
      icon: 'airplane-outline',
      current: 3000,
      target: 5000,
      daysLeft: 48,
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'Fondo de Educación',
      icon: 'school-outline',
      current: 2000,
      target: 5000,
      daysLeft: 80,
      createdAt: new Date(),
    },
    {
      id: '4',
      name: 'Actualización de Tecnología',
      icon: 'desktop-outline',
      current: 300,
      target: 1000,
      daysLeft: 120,
      createdAt: new Date(),
    },
    {
      id: '5',
      name: 'Fondo de Auto',
      icon: 'car-outline',
      current: 0,
      target: 15000,
      daysLeft: 365,
      createdAt: new Date(),
    },
  ],
  selectedGoals: [],
  isSelectionMode: false,
  addGoal: (goal) =>
    set((state) => ({
      goals: [
        ...state.goals,
        {
          ...goal,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date(),
        },
      ],
    })),
  updateGoal: (id, updatedGoal) =>
    set((state) => ({
      goals: state.goals.map((goal) => (goal.id === id ? { ...goal, ...updatedGoal } : goal)),
    })),
  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id),
    })),
  toggleSelectionMode: () =>
    set((state) => ({
      isSelectionMode: !state.isSelectionMode,
      selectedGoals: !state.isSelectionMode ? [] : state.selectedGoals,
    })),
  toggleGoalSelection: (id) =>
    set((state) => ({
      selectedGoals: state.selectedGoals.includes(id) ? state.selectedGoals.filter((goalId) => goalId !== id) : [...state.selectedGoals, id],
    })),
  selectAllGoals: () =>
    set((state) => ({
      selectedGoals: state.goals.map((goal) => goal.id),
    })),
  clearSelection: () =>
    set((state) => ({
      selectedGoals: [],
      isSelectionMode: false,
    })),
  deleteSelectedGoals: () =>
    set((state) => ({
      goals: state.goals.filter((goal) => !state.selectedGoals.includes(goal.id)),
      selectedGoals: [],
      isSelectionMode: false,
    })),
}))
