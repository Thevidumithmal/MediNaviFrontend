import React, { useState } from 'react'

export default function StockTable({ items, onUpdate }) {
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ quantity: '', price: '' })

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({ quantity: item.quantity, price: item.price })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ quantity: '', price: '' })
  }

  const save = async (id) => {
    await onUpdate(id, { quantity: Number(form.quantity), price: Number(form.price) })
    cancelEdit()
  }

  if (!items || items.length === 0) {
    return <div className="card p-6 text-center text-gray-600">No stock items yet.</div>
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left p-3">Medicine</th>
            <th className="text-left p-3">Quantity</th>
            <th className="text-left p-3">Price</th>
            <th className="text-right p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const isEditing = editingId === it.id
            return (
              <tr key={it.id} className="border-t">
                <td className="p-3 font-medium">{it.medicineName}</td>
                <td className="p-3">
                  {isEditing ? (
                    <input className="input" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
                  ) : (
                    it.quantity
                  )}
                </td>
                <td className="p-3">
                  {isEditing ? (
                    <input className="input" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                  ) : (
                    `Rs. ${it.price}`
                  )}
                </td>
                <td className="p-3 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                      <button className="btn" onClick={() => save(it.id)}>Save</button>
                    </div>
                  ) : (
                    <button className="btn-secondary" onClick={() => startEdit(it)}>Edit</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
