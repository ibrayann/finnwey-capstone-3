export interface ReceiptItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ReceiptData {
  merchantName: string | null
  category: string | null
  subcategory: string | null
  merchantType: string | null
  transactionDate: string | null
  totalAmount: number | null
  currency: string | null
  items: ReceiptItem[]
  paymentMethod: string | null
  merchantAddress: string | null
  merchantRut: string | null
  receiptNumber: string | null
  ocrConfidence: number | null
}

export interface ScanReceiptResponse {
  success: boolean
  data?: ReceiptData
  error?: string
}
