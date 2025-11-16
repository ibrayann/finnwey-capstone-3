import { useState } from 'react'
import { ReceiptService } from '../services/receipt.service'
import { ReceiptData } from '@/types/receipt'

export function useScanReceipt() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<ReceiptData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scanReceipt = async (imageUri: string) => {
    setIsScanning(true)
    setError(null)
    setScannedData(null)

    try {
      const response = await ReceiptService.scanReceipt(imageUri)

      if (!response.success) {
        throw new Error(response.error || 'Error al escanear la boleta')
      }

      if (!response.data) {
        throw new Error('No se obtuvieron datos de la boleta')
      }

      setScannedData(response.data)
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setIsScanning(false)
    }
  }

  const reset = () => {
    setIsScanning(false)
    setScannedData(null)
    setError(null)
  }

  return {
    scanReceipt,
    isScanning,
    scannedData,
    error,
    reset,
  }
}
