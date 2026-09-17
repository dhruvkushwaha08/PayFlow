export async function getOvertime() {
  const response = await fetch('http://localhost:8080/api/overtime')

  if (!response.ok) {
    throw new Error('Failed to fetch overtime records')
  }

  return response.json()
}