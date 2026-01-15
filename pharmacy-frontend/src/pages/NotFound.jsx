import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-gray-600 mt-2">The page you requested does not exist.</p>
      <Link to="/" className="btn mt-6">Go Home</Link>
    </div>
  )
}
