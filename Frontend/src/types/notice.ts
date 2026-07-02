export interface Notice {
  id: string
  title: string
  content: string
  category: string
  posted_by?: string
  attachment?: string
  publish_date: string
  expiry_date?: string
}
