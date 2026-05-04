import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_menu/parcels/')({
  staticData: {
    title: 'Parcels',
  },
  component: ParcelsPage,
})

function ParcelsPage() {
  return <div>Hello "/_authenticated/_menu/parcels/"!</div>
}
