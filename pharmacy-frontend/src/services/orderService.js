import api from './api'

export async function createOrder(payload) {
  const { data } = await api.post('/orders/create', payload)
  return data
}

export async function getCustomerOrders(customerId, params = {}) {
  const { data } = await api.get(`/customers/${customerId}/orders`, { params })
  // Support multiple list formats: { data: [...] }, { content: [...] }, or [...]
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.content)) return data.content
  return []
}

export async function getOrderById(orderId) {
  const { data } = await api.get(`/orders/${orderId}`)
  return data
}

export async function updateOrderStatus(orderId, { status, message }) {
  const { data } = await api.patch(`/orders/${orderId}/status`, { status, message })
  return data
}
