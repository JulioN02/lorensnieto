import { useState } from 'react'
import { paymentService } from '../services'

interface PaymentModalProps {
  reservationId: string
  pendingBalance: number
  onClose: () => void
  onSuccess: () => void
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function PaymentModal({ reservationId, pendingBalance, onClose, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState<number>(pendingBalance)
  const [type, setType] = useState<'abono' | 'total'>(
    pendingBalance > 0 ? 'abono' : 'total'
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If amount equals pending balance, auto-select "total"
  const handleAmountChange = (value: number) => {
    setAmount(value)
    if (value >= pendingBalance) {
      setType('total')
    } else if (value > 0) {
      setType('abono')
    }
  }

  const handleSubmit = async () => {
    setError(null)

    if (!amount || amount <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    if (amount > pendingBalance) {
      setError(`El monto no puede exceder el saldo pendiente de ${formatPrice(pendingBalance)}`)
      return
    }

    setIsSubmitting(true)
    try {
      await paymentService.createPayment(reservationId, {
        amount,
        type,
        status: 'pagado',
      })
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar pago'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Registrar Pago</h3>
        <p className="mb-4 mt-1 text-sm text-gray-500">
          Saldo pendiente: <span className="font-medium text-gray-900">{formatPrice(pendingBalance)}</span>
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700">
              Monto
            </label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                $
              </span>
              <input
                id="payment-amount"
                type="number"
                min={1}
                max={pendingBalance}
                value={amount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2.5 text-gray-900 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setType('abono')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  type === 'abono'
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Abono
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('total')
                  setAmount(pendingBalance)
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  type === 'total'
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Total
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Monto a registrar:</span>
              <span className="font-medium text-gray-900">{formatPrice(amount)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Saldo restante:</span>
              <span className="font-medium text-gray-900">{formatPrice(pendingBalance - amount)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registrando...
              </>
            ) : (
              'Registrar Pago'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
