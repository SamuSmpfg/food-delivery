const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET

const uriToDataUri = async (uri: string): Promise<string> => {
  const response = await fetch(uri)
  const blob = await response.blob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read the image.'))
    reader.readAsDataURL(blob)
  })
}

export async function uploadImage(uri: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured.')
  }

  const dataUri = await uriToDataUri(uri)

  const body = new URLSearchParams()
  body.append('file', dataUri)
  body.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.secure_url) {
    throw new Error(data?.error?.message ?? 'Falha ao enviar a imagem.')
  }

  return data.secure_url
}