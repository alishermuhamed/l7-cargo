import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'

import {
  getClient,
  getClients,
  type GetClientsParams,
  getParcel,
  getParcels,
  getParcelsImport,
  getParcelsImports,
  type GetParcelsImportsParams,
  type GetParcelsParams,
  getParcelStatusHistory,
  getUser,
  getUsers,
  type GetUsersParams,
} from './api.gen'

// Clients

export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: (params?: GetClientsParams) =>
    [...clientsKeys.lists(), params ?? {}] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (clientId: string) => [...clientsKeys.details(), clientId] as const,
}

export const getClientsQueryOptions = (params?: GetClientsParams) =>
  queryOptions({
    queryKey: clientsKeys.list(params),
    queryFn: () => getClients(params),
  })

export const getClientQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: clientsKeys.detail(clientId),
    queryFn: () => getClient(clientId),
  })

export const getClientsInfiniteQueryOptions = (params?: GetClientsParams) =>
  infiniteQueryOptions({
    queryKey: clientsKeys.list(params),
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) =>
      getClients({
        ...params,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const pageSize = params?.limit ?? 10

      if (lastPage.length < pageSize) {
        return undefined
      }

      return allPages.reduce((total, page) => total + page.length, 0)
    },
  })

// Users

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params?: GetUsersParams) =>
    [...usersKeys.lists(), params ?? {}] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (userId: string) => [...usersKeys.details(), userId] as const,
}

export const getUsersQueryOptions = (params?: GetUsersParams) =>
  queryOptions({
    queryKey: usersKeys.list(params),
    queryFn: () => getUsers(params),
  })

export const getUserQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: usersKeys.detail(userId),
    queryFn: () => getUser(userId),
  })

export const getUsersInfiniteQueryOptions = (params?: GetUsersParams) =>
  infiniteQueryOptions({
    queryKey: usersKeys.list(params),
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) =>
      getUsers({
        ...params,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const pageSize = params?.limit ?? 10

      if (lastPage.length < pageSize) {
        return undefined
      }

      return allPages.reduce((total, page) => total + page.length, 0)
    },
  })

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

export const getParcelsInfiniteQueryOptions = (params?: GetParcelsParams) =>
  infiniteQueryOptions({
    queryKey: parcelsKeys.list(params),
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) =>
      getParcels({
        ...params,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const pageSize = params?.limit ?? 10

      if (lastPage.length < pageSize) {
        return undefined
      }

      return allPages.reduce((total, page) => total + page.length, 0)
    },
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

// Parcels imports

export const parcelsImportsKeys = {
  all: ['parcelsImports'] as const,
  lists: () => [...parcelsImportsKeys.all, 'list'] as const,
  list: (params?: GetParcelsImportsParams) =>
    [...parcelsImportsKeys.lists(), params ?? {}] as const,
  details: () => [...parcelsImportsKeys.all, 'detail'] as const,
  detail: (parcelsImportId: string) =>
    [...parcelsImportsKeys.details(), parcelsImportId] as const,
}

export const getParcelsImportsQueryOptions = (
  params?: GetParcelsImportsParams
) =>
  queryOptions({
    queryKey: parcelsImportsKeys.list(params),
    queryFn: () => getParcelsImports(params),
  })

export const getParcelsImportsInfiniteQueryOptions = (
  params?: GetParcelsImportsParams
) =>
  infiniteQueryOptions({
    queryKey: parcelsImportsKeys.list(params),
    initialPageParam: 0,
    queryFn: ({ pageParam = 0 }) =>
      getParcelsImports({
        ...params,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const pageSize = params?.limit ?? 10

      if (lastPage.length < pageSize) {
        return undefined
      }

      return allPages.reduce((total, page) => total + page.length, 0)
    },
  })

export const getParcelsImportQueryOptions = (parcelsImportId: string) =>
  queryOptions({
    queryKey: parcelsImportsKeys.detail(parcelsImportId),
    queryFn: () => getParcelsImport(parcelsImportId),
  })
