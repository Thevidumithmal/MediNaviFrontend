import React, { useRef, useState } from 'react'
import Swal from 'sweetalert2'

export default function FileUpload({ label = 'Upload image', accept = 'image/*', onFileSelected }) {
  const inputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      // Validate that the file is an image
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select an image file only (JPEG, PNG, GIF, etc.)',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'OK'
        })
        // Clear the input
        if (inputRef.current) inputRef.current.value = ''
        return
      }

      setSelectedFile(file)
      
      // Create preview if it's an image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
      
      if (onFileSelected) onFileSelected(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    if (onFileSelected) onFileSelected(null)
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition">
      <div className="flex flex-col items-center gap-4">
        {!selectedFile ? (
          <>
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="text-center">
              <p className="font-semibold text-gray-700">{label}</p>
              <p className="text-sm text-gray-500 mt-1">Click below to select a file</p>
              <p className="text-xs text-gray-400 mt-1">Accepted: {accept}</p>
            </div>
            <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
            <button 
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
              onClick={() => inputRef.current?.click()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Choose File
            </button>
          </>
        ) : (
          <>
            {preview ? (
              <div className="w-full">
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full max-h-64 object-contain rounded-lg border border-gray-300"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected
                  </div>
                </div>
              </div>
            ) : (
              <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            
            <div className="text-center w-full">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-semibold text-green-800 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  File Selected
                </p>
                <p className="text-sm text-green-700 mt-1 break-all">{selectedFile.name}</p>
                <p className="text-xs text-green-600 mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
              <button 
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2"
                onClick={() => inputRef.current?.click()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Change File
              </button>
              <button 
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2"
                onClick={clearFile}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
