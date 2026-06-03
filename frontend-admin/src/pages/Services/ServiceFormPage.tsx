import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serviceService } from '../../services'
import type { Service, ServiceClassification } from '../../types'
import { SERVICE_CLASSIFICATIONS, SERVICE_CLASSIFICATION_LABELS } from '../../types'

interface FormState {
  name: string
  description: string
  classification: ServiceClassification
  type: string
  price: string
  rules: string[]
  active: boolean
}

const initialFormState: FormState = {
  name: '',
  description: '',
  classification: SERVICE_CLASSIFICATIONS.ALIMENTACION,
  type: '',
  price: '',
  rules: [],
  active: true,
}

export function ServiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  const [form, setForm] = useState<FormState>(initialFormState)
  const [files, setFiles] = useState<FileList | null>(null)
  const [existingMedia, setExistingMedia] = useState<Service['media']>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEditMode)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  // Load existing service for edit mode
  useEffect(() => {
    if (!id) return

    const loadService = async () => {
      try {
        const service = await serviceService.getService(id)
        setForm({
          name: service.name,
          description: service.description,
          classification: service.classification,
          type: service.type,
          price: String(service.price),
          rules: service.rules,
          active: service.active,
        })
        setExistingMedia(service.media)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar servicio'
        setSubmitError(message)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadService()
  }, [id])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      mediaPreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [mediaPreviews])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      setFiles(selectedFiles)
      // Create preview URLs
      const previews: string[] = []
      Array.from(selectedFiles).forEach((file) => {
        previews.push(URL.createObjectURL(file))
      })
      // Cleanup old previews
      mediaPreviews.forEach((url) => URL.revokeObjectURL(url))
      setMediaPreviews(previews)
    }
  }

  // Add rule tag
  const handleAddRule = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!form.rules.includes(tagInput.trim())) {
        setForm((prev) => ({
          ...prev,
          rules: [...prev.rules, tagInput.trim()],
        }))
      }
      setTagInput('')
    }
  }

  const handleRemoveRule = (index: number) => {
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }))
  }

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type: inputType } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setForm((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }))
  }

  // Build FormData for submission
  const buildFormData = (): FormData => {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('classification', form.classification)
    formData.append('type', form.type)
    formData.append('price', form.price)
    formData.append('rules', JSON.stringify(form.rules))
    formData.append('active', String(form.active))

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append('media', file)
      })
    }

    return formData
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = buildFormData()
      if (isEditMode && id) {
        await serviceService.updateService(id, formData)
      } else {
        await serviceService.createService(formData)
      }
      navigate('/services')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar servicio'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state for edit mode
  if (isLoadingData) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Cargando...</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          <div className="h-10 w-full rounded-lg bg-gray-200" />
          <div className="h-24 w-full rounded-lg bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode ? 'Actualiza los datos del servicio' : 'Registra un nuevo servicio en el sistema'}
        </p>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
          {submitError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Información General</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ej: Servicio de Catering"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Classification */}
            <div>
              <label htmlFor="classification" className="block text-sm font-medium text-gray-700">
                Clasificación
              </label>
              <select
                id="classification"
                name="classification"
                value={form.classification}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {Object.entries(SERVICE_CLASSIFICATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <input
                id="type"
                name="type"
                type="text"
                value={form.type}
                onChange={handleChange}
                required
                placeholder="Ej: Catering básico"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Precio (COP)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="Ej: 150000"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe el servicio..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Tags: Rules */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Reglas</h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {form.rules.map((rule, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700"
              >
                {rule}
                <button
                  type="button"
                  onClick={() => handleRemoveRule(index)}
                  className="ml-1 text-amber-400 hover:text-amber-600"
                  aria-label={`Eliminar ${rule}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddRule}
            placeholder="Escribe una regla y presiona Enter"
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Media Gallery */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Galería de Medios</h3>

          {/* Existing media in edit mode */}
          {isEditMode && existingMedia.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-600">Medios existentes:</p>
              <div className="flex flex-wrap gap-3">
                {existingMedia.map((media) => (
                  <div key={media.id} className="relative">
                    {media.mediaType === 'img' ? (
                      <img
                        src={media.url}
                        alt=""
                        className="h-24 w-32 rounded-lg object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="h-24 w-32 rounded-lg object-cover"
                        controls
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview of new files */}
          {mediaPreviews.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-600">Nuevos archivos:</p>
              <div className="flex flex-wrap gap-3">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    {files?.[index]?.type.startsWith('video') ? (
                      <video
                        src={preview}
                        className="h-24 w-32 rounded-lg object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-32 rounded-lg object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-accent hover:bg-accent/5">
            <svg
              className="mb-2 h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-accent">Click para subir</span> o arrastra y suelta
            </p>
            <p className="text-xs text-gray-400">Imágenes y videos (máx. 10 archivos)</p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Active toggle */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Estado</h3>
              <p className="text-sm text-gray-500">Activar o desactivar el servicio</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="h-7 w-12 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-green-500 peer-checked:after:translate-x-5" />
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : isEditMode ? (
              'Guardar Cambios'
            ) : (
              'Crear Servicio'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 border border-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
