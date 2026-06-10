import { useState, useEffect, type FormEvent } from 'react'
import { getAdminSettings, updateAdminSettings } from '../../services'
import type { AdminSettings } from '../../types'

interface ToastState {
  type: 'success' | 'error'
  message: string
}

function toPercentage(decimal: number): string {
  return (decimal * 100).toFixed(1)
}

function fromPercentage(pct: string): number {
  return Number((Number(pct) / 100).toFixed(4))
}

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const [commissionPct, setCommissionPct] = useState('10')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [partnerDeadlineDays, setPartnerDeadlineDays] = useState('5')
  const [rulesDocUrl, setRulesDocUrl] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getAdminSettings()
        if (settings) {
          setCommissionPct(toPercentage(Number(settings.commissionPct)))
          setNotificationEmail(settings.notificationEmail ?? '')
          setPartnerDeadlineDays(String(settings.partnerDeadlineDays ?? 5))
          setRulesDocUrl(settings.rulesDocUrl ?? '')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar configuración'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setToast(null)

    // Client-side validation
    const pctNum = Number(commissionPct)
    const daysNum = Number(partnerDeadlineDays)

    if (pctNum < 0 || pctNum > 100) {
      setToast({ type: 'error', message: 'El porcentaje de comisión debe estar entre 0 y 100' })
      return
    }

    if (!notificationEmail || !notificationEmail.includes('@')) {
      setToast({ type: 'error', message: 'Ingresa un email de notificación válido' })
      return
    }

    if (daysNum < 1 || daysNum > 90 || !Number.isInteger(daysNum)) {
      setToast({ type: 'error', message: 'Los días para pago del socio deben ser un número entero entre 1 y 90' })
      return
    }

    if (rulesDocUrl && !rulesDocUrl.startsWith('http://') && !rulesDocUrl.startsWith('https://')) {
      setToast({ type: 'error', message: 'La URL debe comenzar con http:// o https://' })
      return
    }

    setIsSaving(true)

    try {
      const payload: Partial<AdminSettings> = {
        commissionPct: fromPercentage(commissionPct),
        notificationEmail,
        partnerDeadlineDays: daysNum,
        rulesDocUrl,
      }

      await updateAdminSettings(payload)
      setToast({ type: 'success', message: 'Configuración guardada exitosamente' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar configuración'
      setToast({ type: 'error', message })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Configuración</h2>
        <div className="animate-pulse space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Configuración</h2>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Configuración</h2>

      {toast && (
        <div
          className={`mb-6 rounded-lg border p-4 text-sm ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="commissionPct"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Porcentaje de Comisión (%)
              </label>
              <input
                id="commissionPct"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Porcentaje de comisión para el socio técnico (0-100%)
              </p>
            </div>

            <div>
              <label
                htmlFor="notificationEmail"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email de Notificación
              </label>
              <input
                id="notificationEmail"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="admin@lorensnieto.com"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Correo para notificaciones del sistema
              </p>
            </div>

            <div>
              <label
                htmlFor="partnerDeadlineDays"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Días para Pago del Socio
              </label>
              <input
                id="partnerDeadlineDays"
                type="number"
                min="1"
                max="90"
                step="1"
                value={partnerDeadlineDays}
                onChange={(e) => setPartnerDeadlineDays(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Días hábiles para que el socio técnico realice el pago (1-90)
              </p>
            </div>

            <div>
              <label
                htmlFor="rulesDocUrl"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                URL Reglas de Negocio
              </label>
              <input
                id="rulesDocUrl"
                type="url"
                value={rulesDocUrl}
                onChange={(e) => setRulesDocUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="https://docs.google.com/document/d/..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Enlace al documento con las reglas de negocio (opcional)
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
