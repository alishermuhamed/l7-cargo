import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_menu/address/')({
  component: AddressPage,
})

function AddressPage() {
  return <div>Hello "/_authenticated/_menu/address/"!</div>
}
