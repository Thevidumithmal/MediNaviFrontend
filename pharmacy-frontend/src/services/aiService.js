import aiApi from './aiApi'

export async function ocrPrescription(file) {
  const formData = new FormData()
  // FastAPI expects: form-data field name 'file'
  formData.append('file', file)

  const { data } = await aiApi.post('/ocr/prescription', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return Array.isArray(data) ? data : (data?.medicines || [])
}

export async function fuzzySearch(query, medicine_list) {
  const { data } = await aiApi.post('/search/fuzzy', { query, medicine_list })
  return Array.isArray(data) ? data : (data?.medicines || [])
}
