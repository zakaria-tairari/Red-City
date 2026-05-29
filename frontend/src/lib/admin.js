export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  const message = error?.response?.data?.message
  const errors = error?.response?.data?.errors

  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat().filter(Boolean)[0]
    if (first) return first
  }

  return message || fallback
}
