import api from './api'

export async function getPharmacyStock(pharmacyId) {
  const { data } = await api.get(`/pharmacy/stock/${pharmacyId}`)
  return data
}

export async function addStock(payload) {
  const { data } = await api.post('/pharmacy/stock/add', payload)
  return data
}

export async function updateStock(stockId, payload) {
  const { data } = await api.put(`/pharmacy/stock/update/${stockId}`, payload)
  return data
}

export async function getPharmacyOrders(pharmacyId) {
  const { data } = await api.get(`/pharmacy/orders/${pharmacyId}`)
  return data
}

export async function createInvoice(payload) {
  const { data } = await api.post('/pharmacy/invoices/create', payload)
  return data
}

export async function getPharmacyInvoices(pharmacyId, params = {}) {
  const { data } = await api.get(`/pharmacy/invoices/${pharmacyId}`, { params })
  // Normalize common pageable formats
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.content)) return data.content
  return []
}

export async function getInvoiceDetail(pharmacyId, invoiceId) {
  const { data } = await api.get(`/pharmacy/invoices/${pharmacyId}/${invoiceId}`)
  return data
}
