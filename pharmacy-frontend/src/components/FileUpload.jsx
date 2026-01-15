import React, { useRef } from 'react'

export default function FileUpload({ label = 'Upload image', accept = 'image/*', onFileSelected }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file && onFileSelected) onFileSelected(file)
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">Accepted: {accept}</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
          <button className="btn" onClick={() => inputRef.current?.click()}>Choose File</button>
        </div>
      </div>
    </div>
  )
}
