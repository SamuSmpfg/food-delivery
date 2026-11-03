const API_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

export const getJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message ?? 'Request failed')
  }

  return data as T
}

export const postJson = async <T,>(
  path: string,
  body: unknown
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message ?? 'Request failed')
  }

  return data as T
}