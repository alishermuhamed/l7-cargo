export class ApiError extends Error {
  status: number
  data: unknown
  headers: Headers

  constructor(response: Response, data: unknown) {
    super(`API request failed with status ${response.status}`)
    this.name = 'ApiError'
    this.status = response.status
    this.data = data
    this.headers = response.headers
  }
}

function shouldSetJsonContentType(body: BodyInit | null | undefined): boolean {
  if (!body) {
    return false
  }

  return (
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(body)
  )
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if ([204, 205, 304].includes(response.status) || !response.body) {
    return undefined
  }

  const contentType = response.headers.get('Content-Type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

const API_URL = import.meta.env.VITE_API_URL

export async function customFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (shouldSetJsonContentType(options.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: options.credentials ?? 'include',
    headers,
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(response, data)
  }

  return data as T
}
