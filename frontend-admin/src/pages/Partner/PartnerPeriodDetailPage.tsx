import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPartnerPeriod, confirmPayment, registerPartialPayment, disputePeriod } from '../../services'
import type { PartnerPeriod } from '../../types'
import { PARTNER_PERIOD_STATUS_CONFIG } from '../../types'

const currencyFormat = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)

const monthFormat = (monthStr: string) => {
  const [year, month] = monthStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long' }).format(date)
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded bg-gray-200" />
      <div className="grid gap-6 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
            <div className="h-8 w-28 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PartnerPeriodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<PartnerPeriod | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadPeriod = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await getPartnerPeriod(id)
      setPeriod(res.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar período'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPeriod()
  }, [loadPeriod])

  const handleConfirmPayment = async () => {
    if (!period || !window.confirm('¿Confirmar pago completo de este período?')) return
    setActionLoading(true)
    try {
      await confirmPayment(period.id)
      await loadPeriod()
    } catch {
      alert('Error al confirmar el pago')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePartialPayment = async () => {
    if (!period) return
    const amountStr = window.prompt('Ingrese el monto del pago parcial (COP):')
    if (!amountStr) return
    const amount = Number(amountStr.replace(/[^0-9]/g, ''))
    if (!amount || amount <= 0) {
      alert('Ingrese un monto válido')
      return
    }
    setActionLoading(true)
    try {
      await registerPartialPayment(period.id, amount)
      await loadPeriod()
    } catch {
      alert('Error al registrar pago parcial')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDispute = async () => {
    if (!period) return
    const notes = window.prompt('Describa el motivo de la disputa:')
    if (notes === null) return
    setActionLoading(true)
    try {
      await disputePeriod(period.id, notes || undefined)
      await loadPeriod()
    } catch {
      alert('Error al marcar disputa')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolveDispute = async () => {
    if (!period || !window.confirm('¿Marcar este período como pendiente nuevamente?')) return
    // We use the confirm-payment endpoint logic but in a different way
    // For simplicity, we re-mark it as pendiente (no direct API, let's use dispute with empty notes + status change)
    // Actually the backend doesn't have a "resolve dispute" endpoint. Let's handle it client-side.
    // For now we just notify the user this needs admin intervention.
    alert('Para resolver la disputa, contacte a la administradora.')
  }

  const getStatusBadge = (status: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const config = PARTNER_PERIOD_STATUS_CONFIG[status as keyof typeof PARTNER_PERIOD_STATUS_CONFIG]
    if (!config) return null
    const sizeClasses = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-0.5 text-sm', lg: 'px-3 py-1 text-base' }
    return (
      <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // --- Loading ---
  if (isLoading) {
    return <SkeletonDetail />
  }

  // --- Error ---
  if (error) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate('/partner')}
          className="mb-4 text-sm text-primary hover:underline"
        >
          ← Volver al panel
        </button>
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
          {error}
        </div>
        <button
          type="button"
          onClick={loadPeriod}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!period) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate('/partner')}
          className="mb-4 text-sm text-primary hover:underline"
        >
          ← Volver al panel
        </button>
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-600">
          Período no encontrado
        </div>
      </div>
    )
  }

  const pendingBalance = Number(period.amountDue) - Number(period.amountPaid)
  const isPaid = period.status === 'pagado'
  const isDisputed = period.status === 'en_disputa'
  const isPartial = period.status === 'pagado_parcial'
  const isPending = period.status === 'pendiente' || period.status === 'en_alerta'

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/partner')}
        className="mb-4 flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al panel
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{monthFormat(period.month)}</h2>
          <p className="mt-1 text-sm text-gray-500">Detalle del período de facturación</p>
        </div>
        {getStatusBadge(period.status, 'lg')}
      </div>

      {/* Financial Breakdown */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{currencyFormat(Number(period.revenueTotal))}</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Fase</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {period.phase === 'fase_1' ? 'Fase 1' : 'Fase 2'}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Porcentaje Aplicado</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {(Number(period.pctApplied) * 100).toFixed(0)}%
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Monto Adeudado</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{currencyFormat(Number(period.amountDue))}</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Monto Pagado</p>
          <p className={`mt-1 text-2xl font-bold ${Number(period.amountPaid) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {currencyFormat(Number(period.amountPaid))}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Saldo Pendiente</p>
          <p className={`mt-1 text-2xl font-bold ${pendingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {pendingBalance <= 0 ? '✓ Cancelado' : currencyFormat(pendingBalance)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Acciones</h3>
        <div className="flex flex-wrap gap-3">
          {(isPending || isPartial) && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmPayment}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Procesando...' : isPartial ? 'Confirmar Restante' : 'Confirmar Pago'}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handlePartialPayment}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Pago Parcial
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDispute}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Disputar
              </button>
            </>
          )}

          {isPaid && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              <span>✅</span>
              <span>Este período ya fue pagado. No se requieren acciones.</span>
            </div>
          )}

          {isDisputed && (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-700">
                <span>⚠️</span>
                <span>Este período está en disputa.</span>
              </div>
              <button
                type="button"
                onClick={handleResolveDispute}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Resolver Disputa
              </button>
            </>
          )}
        </div>
      </div>

      {/* Period metadata */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Información del Período</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Fecha de Creación</dt>
            <dd className="font-medium text-gray-900">{formatDate(period.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Última Actualización</dt>
            <dd className="font-medium text-gray-900">{formatDate(period.updatedAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Fecha Límite</dt>
            <dd className="font-medium text-gray-900">{formatDate(period.deadlineDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Fecha de Pago</dt>
            <dd className="font-medium text-gray-900">{formatDate(period.paidAt)}</dd>
          </div>
        </dl>
        {period.disputeNotes && (
          <div className="mt-4 rounded-lg bg-purple-50 p-3">
            <p className="text-xs font-medium text-purple-700">Notas de disputa:</p>
            <p className="mt-1 text-sm text-purple-600">{period.disputeNotes}</p>
          </div>
        )}
      </div>

      {/* Alert History */}
      {period.alerts && period.alerts.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Alertas ({period.alerts.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                  <th className="px-6 py-3 font-medium">Monto Pendiente</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {period.alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(alert.triggeredAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {currencyFormat(Number(alert.amountPending))}
                    </td>
                    <td className="px-6 py-4">
                      {alert.resolvedAt ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Resuelta
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Activa
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!period.alerts || period.alerts.length === 0) && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-center text-sm text-gray-500">No hay alertas registradas para este período</p>
        </div>
      )}
    </div>
  )
}
