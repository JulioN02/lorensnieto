import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leadService } from '../../services'
import type { Lead } from '../../types'
import { LEAD_STATUS, LEAD_STATUS_CONFIG } from '../../types'

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function InboxDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  // Convert modal state
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)

  // Discard confirm
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const loadLead = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await leadService.getLead(id)
      setLead(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar solicitud'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLead()
  }, [id])

  const handleMarkAsReviewed = async () => {
    if (!lead) return
    try {
      const updated = await leadService.updateLeadStatus(lead.id, LEAD_STATUS.REVISADA)
      setLead(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar estado'
      alert(message)
    }
  }

  const handleDiscard = async () => {
    if (!lead) return
    try {
      const updated = await leadService.updateLeadStatus(lead.id, LEAD_STATUS.DESCARTADA)
      setLead(updated)
      setShowDiscardConfirm(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al descartar solicitud'
      alert(message)
    }
  }

  const handleReopen = async () => {
    if (!lead) return
    try {
      const updated = await leadService.updateLeadStatus(lead.id, LEAD_STATUS.REVISADA)
      setLead(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al reabrir solicitud'
      alert(message)
    }
  }

  const handleAddNote = async () => {
    if (!lead || !noteContent.trim()) return
    setIsAddingNote(true)
    try {
      await leadService.addLeadNote(lead.id, noteContent.trim())
      setNoteContent('')
      // Reload to get the new note
      await loadLead()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar nota'
      alert(message)
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleConvert = async () => {
    if (!lead) return

    const propertyId = lead.propertyId
    if (!propertyId) {
      setConvertError('Este lead no tiene una propiedad asociada. Selecciona una propiedad para convertir.')
      return
    }

    const dateStart = (document.getElementById('convert-date-start') as HTMLInputElement)?.value
    const dateEnd = (document.getElementById('convert-date-end') as HTMLInputElement)?.value

    if (!dateStart || !dateEnd) {
      setConvertError('Debes seleccionar fechas de inicio y fin')
      return
    }

    setIsConverting(true)
    setConvertError(null)

    try {
      const reservation = await leadService.convertLeadToReservation(lead.id, {
        propertyId,
        customerName: lead.customerName,
        customerCedula: lead.customerCedula,
        customerPhone: lead.customerPhone,
        customerEmail: lead.customerEmail,
        dateStart: new Date(dateStart).toISOString(),
        dateEnd: new Date(dateEnd).toISOString(),
        additionalServices: [],
        observations: '',
      })
      setShowConvertModal(false)
      navigate(`/reservations/${reservation.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al convertir solicitud'
      setConvertError(message)
    } finally {
      setIsConverting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
        <div className="h-48 rounded-xl bg-gray-200" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/inbox')}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a bandeja de entrada
          </button>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadLead}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!lead) return null

  const statusConfig = LEAD_STATUS_CONFIG[lead.status] ?? { label: lead.status, color: 'bg-gray-100 text-gray-800' }
  const isNew = lead.status === LEAD_STATUS.NUEVA
  const isReviewed = lead.status === LEAD_STATUS.REVISADA
  const isConverted = lead.status === LEAD_STATUS.CONVERTIDA
  const isDiscarded = lead.status === LEAD_STATUS.DESCARTADA

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/inbox')}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a bandeja de entrada
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lead.customerName}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Recibido: {formatDateTime(lead.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Información del Cliente</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Nombre</dt>
              <dd className="text-sm font-medium text-gray-900">{lead.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Cédula</dt>
              <dd className="text-sm font-medium text-gray-900">{lead.customerCedula}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Teléfono</dt>
              <dd className="text-sm font-medium text-gray-900">{lead.customerPhone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{lead.customerEmail}</dd>
            </div>
          </dl>
        </div>

        {/* Request Info */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Información de la Solicitud</h3>
          <dl className="space-y-3">
            {lead.property ? (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Propiedad</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {lead.property.name}
                  <span className="ml-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {lead.property.type === 'casa_campo' ? 'Casa de Campo' : 'Apartamento'}
                  </span>
                </dd>
              </div>
            ) : lead.service ? (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Servicio</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {lead.service.name}
                  <span className="ml-2 inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    {lead.service.classification}
                  </span>
                </dd>
              </div>
            ) : null}
            {lead.dateInterest && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Fecha de interés</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(lead.dateInterest)}</dd>
              </div>
            )}
            {lead.additionalServices.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Servicios adicionales</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {lead.additionalServices.join(', ')}
                </dd>
              </div>
            )}
            {lead.notes && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Notas del cliente</dt>
                <dd className="text-sm text-gray-900">{lead.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Status Actions */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Acciones</h3>

          {isNew && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Esta solicitud está sin revisar.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleMarkAsReviewed}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-600"
                >
                  Marcar como Revisada
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}

          {isReviewed && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">¿Qué deseas hacer con esta solicitud?</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Convertir a Reserva
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}

          {isConverted && (
            <div className="space-y-3">
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                Esta solicitud ha sido convertida a reserva.
              </div>
              {lead.reservation && (
                <button
                  type="button"
                  onClick={() => navigate(`/reservations/${(lead.reservation as any).id}`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  Ver Reserva
                </button>
              )}
            </div>
          )}

          {isDiscarded && (
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-medium">Solicitud descartada</p>
                {lead.notes && <p className="mt-1 text-gray-500">{lead.notes}</p>}
              </div>
              <button
                type="button"
                onClick={handleReopen}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Reabrir
              </button>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Notas Internas</h3>

          {/* Add note form */}
          <div className="mb-6">
            <textarea
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Agregar una nota interna..."
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={isAddingNote || !noteContent.trim()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAddingNote ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                'Agregar Nota'
              )}
            </button>
          </div>

          {/* Notes list */}
          {lead.leadNotes.length > 0 ? (
            <div className="space-y-4">
              {lead.leadNotes.map((note) => (
                <div key={note.id} className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">{note.content}</p>
                  <p className="mt-2 text-xs text-gray-400">{formatDateTime(note.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <svg
                className="mx-auto mb-3 h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <p className="text-sm text-gray-500">No hay notas internas</p>
            </div>
          )}
        </div>
      </div>

      {/* Discard confirmation dialog */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Descartar Solicitud</h3>
            <p className="mt-2 text-sm text-gray-600">
              ¿Estás segura de descartar esta solicitud de <strong>{lead.customerName}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Reservation modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Convertir a Reserva</h3>
            <p className="mb-4 mt-1 text-sm text-gray-500">
              Selecciona las fechas para la reserva de <strong>{lead.customerName}</strong>.
            </p>

            {convertError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {convertError}
              </div>
            )}

            <div className="space-y-4">
              {/* Property */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Propiedad</label>
                <p className="mt-1 text-sm text-gray-900">
                  {lead.property ? lead.property.name : 'No asociada'}
                </p>
              </div>

              {/* Customer data preview */}
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <p><strong>Cliente:</strong> {lead.customerName}</p>
                <p><strong>Cédula:</strong> {lead.customerCedula}</p>
                <p><strong>Contacto:</strong> {lead.customerPhone}</p>
              </div>

              {/* Date fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="convert-date-start" className="block text-sm font-medium text-gray-700">
                    Fecha de inicio
                  </label>
                  <input
                    id="convert-date-start"
                    type="date"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label htmlFor="convert-date-end" className="block text-sm font-medium text-gray-700">
                    Fecha de fin
                  </label>
                  <input
                    id="convert-date-end"
                    type="date"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConvertModal(false)
                  setConvertError(null)
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConverting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Convirtiendo...
                  </>
                ) : (
                  'Convertir a Reserva'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
