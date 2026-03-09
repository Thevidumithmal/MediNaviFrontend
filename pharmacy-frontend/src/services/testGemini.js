// Simple test script to verify Gemini API is working
// Run this in browser console on your app to test the API

import { chatWithGemini } from './geminiService'

export const testGeminiAPI = async () => {
  console.log('🧪 Testing Gemini API...')
  console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY ? 'Loaded ✅' : 'Missing ❌')
  
  try {
    console.log('Sending test request...')
    const response = await chatWithGemini('What is Paracetamol?', [])
    console.log('✅ Success! Response:', response)
    return { success: true, response }
  } catch (error) {
    console.error('❌ Test Failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Auto-run test (comment out if you don't want auto-test)
// testGeminiAPI()
