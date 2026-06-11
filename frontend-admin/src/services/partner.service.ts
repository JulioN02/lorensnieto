import { api } from './api'
import type { PartnerSummary, PartnerPeriod, PartnerSettings } from '../types/partner'

export async function getPartnerSummary(): Promise<{ data: PartnerSummary }> {
  const res = await api.get('/partner/summary')
  return res.data
}

export async function getPartnerPeriods(): Promise<{ data: PartnerPeriod[] }> {
  const res = await api.get('/partner/periods')
  return res.data
}

export async function getPartnerPeriod(id: string): Promise<{ data: PartnerPeriod }> {
  const res = await api.get(`/partner/periods/${id}`)
  return res.data
}

export async function confirmPayment(periodId: string) {
  const res = await api.post(`/partner/periods/${periodId}/confirm-payment`)
  return res.data
}

export async function registerPartialPayment(periodId: string, amount: number) {
  const res = await api.post(`/partner/periods/${periodId}/partial-payment`, { amount })
  return res.data
}

export async function disputePeriod(periodId: string, notes?: string) {
  const res = await api.post(`/partner/periods/${periodId}/dispute`, { notes })
  return res.data
}

export async function getAlerts() {
  const res = await api.get('/partner/alerts')
  return res.data
}

export async function getPartnerSettings() {
  const res = await api.get('/partner/settings')
  return res.data
}

export async function updatePartnerSettings(data: Partial<PartnerSettings>) {
  const res = await api.put('/partner/settings', data)
  return res.data
}
