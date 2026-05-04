import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_menu/parcels/add')({
  staticData: {
    title: 'Add parcel',
    fallbackTo: '/parcels',
  },
  component: AddParcelPage,
})

function AddParcelPage() {
  return <div>Hello "/_authenticated/_menu/parcels/add"!</div>
}
