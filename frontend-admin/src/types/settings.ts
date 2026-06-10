export interface AdminSettings {
  id: string
  commissionPct: number
  rulesDocUrl: string
  notificationEmail: string
  partnerDeadlineDays: number
}

export interface AdminSettingsForm {
  commissionPct: number
  notificationEmail: string
  partnerDeadlineDays: number
  rulesDocUrl: string
}
