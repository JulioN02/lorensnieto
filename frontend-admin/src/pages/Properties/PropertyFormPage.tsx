import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { propertyService } from '../../services'
import type { Property, PropertyType } from '../../types'
import { PROPERTY_TYPES } from '../../types'

interface FormState {
  type: PropertyType
  name: string
  description: string
  zone: string
  address: string
  capacity: string
  rooms: string
  priceNight: string
  amenities: string[]
  rules: string[]
  active: boolean
  ownerName: string
  ownerCedula: string
  ownerPhone: string
  ownerEmail: string
}

const initialFormState: FormState = {
  type: PROPERTY_TYPES.CASA_CAMPO,
  name: '',
  description: '',
  zone: '',
  address: '',
  capacity: '',
  rooms: '',
  priceNight: '',
  amenities: [],
  rules: [],
  active: true,
  ownerName: '',
  ownerCedula: '',
  ownerPhone: '',
  ownerEmail: '',
}

export function PropertyFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  const [form, setForm] = useState<FormState>(initialFormState)
  const [files, setFiles] = useState<FileList | null>(null)
  const [existingMedia, setExistingMedia] = useState<Property['media']>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEditMode)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState({ amenities: '', rules: '' })

  // Load existing property for edit mode
  useEffect(() => {
    if (!id) return

    const loadProperty = async () => {
      try {
        const property = await propertyService.getProperty(id)
        setForm({
          type: property.type,
          name: property.name,
          description: property.description,
          zone: property.zone,
          address: property.address,
          capacity: String(property.capacity),
          rooms: property.rooms !== null ? String(property.rooms) : '',
          priceNight: String(property.priceNight),
          amenities: property.amenities,
          rules: property.rules,
          active: property.active,
          ownerName: property.ownerName,
          ownerCedula: property.ownerCedula,
          ownerPhone: property.ownerPhone,
          ownerEmail: property.ownerEmail,
        })
        setExistingMedia(property.media)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar propiedad'
        setSubmitError(message)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadProperty()
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

  // Add amenity tag
  const handleAddAmenity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.amenities.trim()) {
      e.preventDefault()
      if (!form.amenities.includes(tagInput.amenities.trim())) {
        setForm((prev) => ({
          ...prev,
          amenities: [...prev.amenities, tagInput.amenities.trim()],
        }))
      }
      setTagInput((prev) => ({ ...prev, amenities: '' }))
    }
  }

  const handleRemoveAmenity = (index: number) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  // Add rule tag
  const handleAddRule = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.rules.trim()) {
      e.preventDefault()
      if (!form.rules.includes(tagInput.rules.trim())) {
        setForm((prev) => ({
          ...prev,
          rules: [...prev.rules, tagInput.rules.trim()],
        }))
      }
      setTagInput((prev) => ({ ...prev, rules: '' }))
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
    formData.append('type', form.type)
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('zone', form.zone)
    formData.append('address', form.address)
    formData.append('capacity', form.capacity)
    formData.append('rooms', form.rooms || '')
    formData.append('priceNight', form.priceNight)
    formData.append('amenities', JSON.stringify(form.amenities))
    formData.append('rules', JSON.stringify(form.rules))
    formData.append('active', String(form.active))
    formData.append('ownerName', form.ownerName)
    formData.append('ownerCedula', form.ownerCedula)
    formData.append('ownerPhone', form.ownerPhone)
    formData.append('ownerEmail', form.ownerEmail)

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
        await propertyService.updateProperty(id, formData)
      } else {
        await propertyService.createProperty(formData)
      }
      navigate('/properties')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar propiedad'
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
          {isEditMode ? 'Editar Propiedad' : 'Nueva Propiedad'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode ? 'Actualiza los datos de la propiedad' : 'Registra una nueva propiedad en el sistema'}
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
            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={isEditMode}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value={PROPERTY_TYPES.CASA_CAMPO}>Casa de Campo</option>
                <option value={PROPERTY_TYPES.APARTAMENTO}>Apartamento</option>
              </select>
            </div>

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
                placeholder="Ej: Casa Campestre La Esperanza"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Zone */}
            <div>
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700">
                Zona
              </label>
              <input
                id="zone"
                name="zone"
                type="text"
                value={form.zone}
                onChange={handleChange}
                required
                placeholder="Ej: Zona Norte"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="Ej: Calle 15 # 20-30"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacidad (personas)
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleChange}
                required
                min="1"
                placeholder="Ej: 8"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Rooms */}
            <div>
              <label htmlFor="rooms" className="block text-sm font-medium text-gray-700">
                Habitaciones
              </label>
              <input
                id="rooms"
                name="rooms"
                type="number"
                value={form.rooms}
                onChange={handleChange}
                min="0"
                placeholder="Ej: 4"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="priceNight" className="block text-sm font-medium text-gray-700">
                Precio por Noche (COP)
              </label>
              <input
                id="priceNight"
                name="priceNight"
                type="number"
                value={form.priceNight}
                onChange={handleChange}
                required
                min="0"
                placeholder="Ej: 250000"
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
              placeholder="Describe la propiedad..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {/* Tags: Amenities */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Amenidades</h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {form.amenities.map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(index)}
                  className="ml-1 text-primary-400 hover:text-primary-600"
                  aria-label={`Eliminar ${amenity}`}
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
            value={tagInput.amenities}
            onChange={(e) => setTagInput((prev) => ({ ...prev, amenities: e.target.value }))}
            onKeyDown={handleAddAmenity}
            placeholder="Escribe una amenidad y presiona Enter"
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
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
            value={tagInput.rules}
            onChange={(e) => setTagInput((prev) => ({ ...prev, rules: e.target.value }))}
            onKeyDown={handleAddRule}
            placeholder="Escribe una regla y presiona Enter"
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Owner Data */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Datos del Propietario</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                value={form.ownerName}
                onChange={handleChange}
                required
                placeholder="Nombre completo"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="ownerCedula" className="block text-sm font-medium text-gray-700">
                Cédula
              </label>
              <input
                id="ownerCedula"
                name="ownerCedula"
                type="text"
                value={form.ownerCedula}
                onChange={handleChange}
                required
                placeholder="Número de cédula"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                id="ownerPhone"
                name="ownerPhone"
                type="tel"
                value={form.ownerPhone}
                onChange={handleChange}
                required
                placeholder="Ej: 3001234567"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                value={form.ownerEmail}
                onChange={handleChange}
                required
                placeholder="correo@ejemplo.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
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
            <p className="text-xs text-gray-400">Imágenes y videos (máx. 20 archivos)</p>
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
              <p className="text-sm text-gray-500">Activar o desactivar la propiedad</p>
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
              'Crear Propiedad'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 border border-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
