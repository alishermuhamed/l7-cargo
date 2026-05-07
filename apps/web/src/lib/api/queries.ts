import { queryOptions } from '@tanstack/react-query'

import {
  getParcel,
  getParcels,
  type GetParcelsParams,
  getParcelStatusHistory,
} from './api.gen'

// Parcels

export const parcelsKeys = {
  all: ['parcels'] as const,
  lists: () => [...parcelsKeys.all, 'list'] as const,
  list: (params?: GetParcelsParams) =>
    [...parcelsKeys.lists(), params ?? {}] as const,
  details: () => [...parcelsKeys.all, 'detail'] as const,
  detail: (parcelId: string) => [...parcelsKeys.details(), parcelId] as const,
  statusHistory: (parcelId: string) =>
    [...parcelsKeys.detail(parcelId), 'statusHistory'] as const,
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

export const getParcelStatusHistoryQueryOptions = (parcelId: string) =>
  queryOptions({
    queryKey: parcelsKeys.statusHistory(parcelId),
    queryFn: () => getParcelStatusHistory(parcelId),
  })
