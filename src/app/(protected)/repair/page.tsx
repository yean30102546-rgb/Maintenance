import { redirect } from 'next/navigation'

export default function RepairPage() {
  // Redirect directly to the create repair page
  redirect('/repair/create')
}
