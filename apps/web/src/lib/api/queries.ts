import { queryOptions } from '@tanstack/react-query'

import { getParcel, getParcels, type GetParcelsParams } from './api.gen'

// Parcels

export const parcelsKeys = {
  all: ['parcels'] as const,
  lists: () => [...parcelsKeys.all, 'list'] as const,
  list: (params?: GetParcelsParams) =>
    [...parcelsKeys.lists(), params ?? {}] as const,
  details: () => [...parcelsKeys.all, 'detail'] as const,
  detail: (parcelId: string) => [...parcelsKeys.details(), parcelId] as const,
}

export const getParcelsQueryOptions = (params?: GetParcelsParams) =>
  queryOptions({
    queryKey: parcelsKeys.list(params),
    queryFn: () => getParcels(params),
  })

export const getParcelQueryOptions = (parcelId: string) =>
  queryOptions({
    queryKey: parcelsKeys.detail(parcelId),
    queryFn: () => getParcel(parcelId),
  })
