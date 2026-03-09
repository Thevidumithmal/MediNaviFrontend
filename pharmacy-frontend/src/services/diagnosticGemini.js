// Diagnostic tool to check available Gemini models
// Open browser console and run: testModels()

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export async function testModels() {
  console.log('🔍 Checking available Gemini models...')
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0,10)}...` : 'MISSING')
  
  try {
    // List available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error:', error)
      return
    }
    
    const data = await response.json()
    console.log('✅ Available models:', data.models)
    
    // Extract model names
    const modelNames = data.models
      ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      ?.map(m => m.name)
    
    console.log('\n📋 Models that support generateContent:')
    modelNames?.forEach(name => console.log(`  - ${name}`))
    
    return modelNames
    
  } catch (error) {
    console.error('❌ Failed to fetch models:', error)
  }
}

// Test a simple generation
export async function testGeneration(modelName = 'gemini-pro') {
  console.log(`\n🧪 Testing generation with ${modelName}...`)
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say hello in one word' }]
        }]
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error:', error)
      return
    }
    
    const data = await response.json()
    console.log('✅ Success! Response:', data)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Make functions available globally for console testing
window.testModels = testModels
window.testGeneration = testGeneration

console.log('💡 Run these commands in console to debug:')
console.log('  testModels() - List available models')
console.log('  testGeneration("model-name") - Test a specific model')
