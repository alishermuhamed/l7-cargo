import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/clients/')({
  component: AdminClientsPage,
})

function AdminClientsPage() {
  return <div>Hello "/_authenticated/admin/customers/"!</div>
}
