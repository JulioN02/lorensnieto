import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPartnerSummary, getPartnerPeriods, confirmPayment, registerPartialPayment, disputePeriod } from '../../services'
import type { PartnerSummary, PartnerPeriod } from '../../types'
import { PARTNER_PERIOD_STATUS_CONFIG } from '../../types'

const currencyFormat = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)

const monthFormat = (monthStr: string) => {
  const [year, month] = monthStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long' }).format(date)
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
      <div className="h-8 w-28 rounded bg-gray-200" />
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 w-full rounded bg-gray-100" />
      ))}
    </div>
  )
}

export function PartnerPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<PartnerSummary | null>(null)
  const [periods, setPeriods] = useState<PartnerPeriod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [summaryRes, periodsRes] = await Promise.all([
        getPartnerSummary(),
        getPartnerPeriods(),
      ])
      setSummary(summaryRes.data)
      setPeriods(periodsRes.data)
      setLastUpdate(new Date().toLocaleString('es-CO'))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos del socio'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleConfirmPayment = async (periodId: string) => {
    if (!window.confirm('¿Confirmar pago completo de este período?')) return
    setActionLoading(periodId)
    try {
      await confirmPayment(periodId)
      await loadData()
    } catch {
      alert('Error al confirmar el pago')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePartialPayment = async (periodId: string) => {
    const amountStr = window.prompt('Ingrese el monto del pago parcial (COP):')
    if (!amountStr) return
    const amount = Number(amountStr.replace(/[^0-9]/g, ''))
    if (!amount || amount <= 0) {
      alert('Ingrese un monto válido')
      return
    }
    setActionLoading(periodId)
    try {
      await registerPartialPayment(periodId, amount)
      await loadData()
    } catch {
      alert('Error al registrar pago parcial')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDispute = async (periodId: string) => {
    const notes = window.prompt('Describa el motivo de la disputa:')
    if (notes === null) return
    setActionLoading(periodId)
    try {
      await disputePeriod(periodId, notes || undefined)
      await loadData()
    } catch {
      alert('Error al marcar disputa')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = PARTNER_PERIOD_STATUS_CONFIG[status as keyof typeof PARTNER_PERIOD_STATUS_CONFIG]
    if (!config) return null
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500'
    if (percent >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Panel Socio Técnico</h2>
        </div>
        <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="mb-6">
          <div className="animate-pulse rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-3 h-4 w-48 rounded bg-gray-200" />
            <div className="mb-2 h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
        <SkeletonTable />
      </div>
    )
  }

  // --- Error State ---
  if (error) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Panel Socio Técnico</h2>
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
          {error}
        </div>
        <button
          type="button"
          onClick={loadData}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const progress = summary?.accumulated ?? { total: 0, target: 3068000, percent: 0 }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Panel Socio Técnico</h2>
          {lastUpdate && (
            <p className="mt-1 text-xs text-gray-500">Última actualización: {lastUpdate}</p>
          )}
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Ingresos del período */}
        <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Ingresos del Período</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {currencyFormat(summary?.ingresos.total ?? 0)}
          </p>
        </div>

        {/* Monto Socio */}
        <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Monto Correspondiente</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {currencyFormat(summary?.partnerAmount ?? 0)}
          </p>
        </div>

        {/* Alertas Activas */}
        <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Alertas Activas</p>
          <div className="mt-1 flex items-center gap-2">
            <p className={`text-3xl font-bold ${(summary?.activeAlerts ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary?.activeAlerts ?? 0}
            </p>
            {(summary?.activeAlerts ?? 0) > 0 && (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                {summary?.activeAlerts}
              </span>
            )}
          </div>
        </div>

        {/* Estado Período Actual */}
        <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Estado Actual</p>
          <div className="mt-2">
            {summary?.period ? (
              getStatusBadge(summary.period.status)
            ) : (
              <span className="text-sm text-gray-400">Sin período activo</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Acumulado del Contrato</h3>
          <span className="text-sm font-medium text-gray-600">
            {currencyFormat(progress.total)} / {currencyFormat(progress.target)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${formatProgressColor(progress.percent)}`}
            style={{ width: `${Math.max(1, progress.percent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700">{progress.percent}% completado</span>
          <span className="text-gray-500">
            {progress.percent >= 100 ? '✅ Meta alcanzada' : `Faltan ${currencyFormat(progress.target - progress.total)}`}
          </span>
        </div>

        {/* Phase indicator */}
        {summary?.period && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5 font-medium">
              {summary.period.phase === 'fase_1' ? 'Fase 1' : 'Fase 2'}
            </span>
            <span>
              Porcentaje aplicado: {(Number(summary.period.pctApplied) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Ingresos Breakdown */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Desglose de Ingresos</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-gray-600">Arrendamientos</span>
            <span className="font-medium text-gray-900">{currencyFormat(summary?.ingresos.arrendamientos ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-sm text-gray-600">Servicios</span>
            <span className="font-medium text-gray-900">{currencyFormat(summary?.ingresos.servicios ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-primary">{currencyFormat(summary?.ingresos.total ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Periods Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Períodos</h3>
        </div>

        {periods.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No hay períodos registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Mes</th>
                  <th className="px-6 py-3 font-medium">Ingresos Totales</th>
                  <th className="px-6 py-3 font-medium">Fase</th>
                  <th className="px-6 py-3 font-medium">% Aplicado</th>
                  <th className="px-6 py-3 font-medium">Monto Adeudado</th>
                  <th className="px-6 py-3 font-medium">Monto Pagado</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {periods.map((period) => {
                  const isPaid = period.status === 'pagado'
                  const isDisputed = period.status === 'en_disputa'
                  return (
                    <tr key={period.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {monthFormat(period.month)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {currencyFormat(Number(period.revenueTotal))}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {period.phase === 'fase_1' ? 'Fase 1' : 'Fase 2'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {(Number(period.pctApplied) * 100).toFixed(0)}%
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {currencyFormat(Number(period.amountDue))}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {currencyFormat(Number(period.amountPaid))}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(period.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/partner/periods/${period.id}`)}
                            className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary-50"
                          >
                            Ver
                          </button>

                          {!isPaid && !isDisputed && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading === period.id}
                                onClick={() => handleConfirmPayment(period.id)}
                                className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
                              >
                                {actionLoading === period.id ? '...' : 'Pagar'}
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading === period.id}
                                onClick={() => handlePartialPayment(period.id)}
                                className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                              >
                                Parcial
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading === period.id}
                                onClick={() => handleDispute(period.id)}
                                className="rounded px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 disabled:opacity-50"
                              >
                                Disputar
                              </button>
                            </>
                          )}

                          {isDisputed && (
                            <span className="text-xs text-gray-400">En disputa</span>
                          )}

                          {isPaid && (
                            <span className="text-xs text-green-500">✓ Pagado</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
