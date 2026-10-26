import parsePhoneNumberFromString from 'libphonenumber-js'

export abstract class OtpProvider {
  abstract readonly name: string

  abstract get isConfigured(): boolean

  abstract send(request: {
    phoneNumber: string
    code: string
    deliveryId?: string
  }): Promise<void>

  protected buildMessage(code: string): string {
    return `L7 Cargo: ${code}`
  }

  protected formatPhoneNumber(phoneNumber: string): string {
    const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber)
    return parsedPhoneNumber?.format('E.164') ?? phoneNumber
  }

  protected async get({
    abortAfterMs = 10_000,
    headers,
    url,
  }: {
    abortAfterMs?: number
    headers: Record<string, string>
    url: string
  }): Promise<Response> {
    const abortController = new AbortController()

    const timeoutId = setTimeout(() => {
      abortController.abort()
    }, abortAfterMs)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: abortController.signal,
      })

      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  protected async post({
    abortAfterMs = 10_000,
    body,
    headers,
    url,
  }: {
    abortAfterMs?: number
    body: string
    headers: Record<string, string>
    url: string
  }): Promise<Response> {
    const abortController = new AbortController()

    const timeoutId = setTimeout(() => {
      abortController.abort()
    }, abortAfterMs)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: abortController.signal,
      })

      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
