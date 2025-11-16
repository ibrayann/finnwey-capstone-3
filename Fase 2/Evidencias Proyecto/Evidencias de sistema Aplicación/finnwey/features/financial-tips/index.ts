// Exports públicos del feature financial-tips
export { FinancialTipService } from './services/financial-tip.service'
export type { FinancialTip, GenerateTipResponse } from './services/financial-tip.service'

export {
  useGenerateFinancialTip,
  useActiveFinancialTips,
  useDismissTip,
  useTipAction,
} from './hooks/useFinancialTip'

export { default as FinancialTipsList } from './components/FinancialTipsList'
export { default as FinancialTipDetail } from './components/FinancialTipDetail'

