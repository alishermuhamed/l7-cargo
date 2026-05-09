import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/customers/')({
  component: AdminCustomersPage,
})

function AdminCustomersPage() {
  return <div>Hello "/_authenticated/admin/customers/"!</div>
}
