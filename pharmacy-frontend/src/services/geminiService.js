// Google Gemini API Service for Medicine Information
// FREE API - Get your key from: https://makersuite.google.com/app/apikey

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE'

// Fallback models to try if one is overloaded (in order of priority)
const FALLBACK_MODELS = [
  'gemini-2.5-flash',      // Try latest 2.5 flash first
  'gemini-2.0-flash',      // Fallback to 2.0 flash
  'gemini-flash-latest',   // Generic latest flash
  'gemini-pro-latest'      // Last resort: pro model
]

const getApiUrl = (modelName) => 
  `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`

// System prompt to restrict chatbot to medicine information only
const SYSTEM_PROMPT = `You are a specialized Medicine Information Assistant. You ONLY provide information about medicines, tablets, drugs, and medications.

RULES YOU MUST FOLLOW:
1. ONLY answer questions about medicines, medications, tablets, drugs, dosages, side effects, uses, and related medical information
2. If asked about anything else (weather, sports, politics, general chat, etc.), politely decline and say: "I can only provide information about medicines and medications. Please ask me about a specific medicine."
3. Provide concise, accurate information about:
   - What the medicine is used for
   - Dosage information
   - Common side effects
   - Precautions and warnings
   - Generic vs brand names
4. Always remind users to consult a healthcare professional
5. Never provide medical diagnosis or treatment advice
6. Keep responses clear, structured, and easy to understand

Format your responses in a clear, organized manner with headings where appropriate.`

/**
 * Chat with Gemini AI about medicine information (with automatic fallback)
 * @param {string} userMessage - The user's question about medicine
 * @param {Array} chatHistory - Previous chat messages for context
 * @returns {Promise<string>} - AI response
 */
export const chatWithGemini = async (userMessage, chatHistory = []) => {
  // Check if API key is configured
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.')
  }

  // Debug: Log API key status (first/last 4 chars only)
  console.log('API Key loaded:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 8)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}` : 'MISSING')

  // Build the conversation history with system prompt
  const contents = [
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I will only provide information about medicines and medications. I will politely decline any other questions. How can I help you with medicine information today?' }]
    }
  ]

  // Add chat history
  chatHistory.forEach(msg => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })
  })

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  })

  // Try each model in sequence until one works
  let lastError = null
  
  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`Trying model: ${modelName}`)
      
      const response = await fetch(`${getApiUrl(modelName)}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`Model ${modelName} failed:`, errorData)
        
        // If high demand, try next model
        if (errorData.error?.message?.includes('high demand') || 
            errorData.error?.message?.includes('overloaded') ||
            response.status === 503) {
          console.log(`Model ${modelName} is overloaded, trying next...`)
          lastError = new Error('Service temporarily busy. Trying alternative model...')
          continue // Try next model
        }
        
        throw new Error(errorData.error?.message || `API Error: ${response.status}`)
      }

      const data = await response.json()
      
      // Extract the response text
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!aiResponse) {
        throw new Error('No response generated')
      }

      console.log(`✅ Success with model: ${modelName}`)
      return aiResponse

    } catch (error) {
      console.error(`Error with model ${modelName}:`, error.message)
      lastError = error
      
      // If it's not a high demand error, stop trying
      if (!error.message?.includes('high demand') && 
          !error.message?.includes('overloaded') &&
          !error.message?.includes('Trying alternative')) {
        break
      }
    }
  }

  // All models failed
  console.error('All models failed:', lastError)
  
  // User-friendly error messages
  if (lastError?.message?.includes('API key not configured')) {
    throw lastError
  }
  if (lastError?.message?.includes('API key not valid') || lastError?.message?.includes('invalid')) {
    throw new Error('Invalid API key. Please verify your Gemini API key.')
  }
  if (lastError?.message?.includes('quota') || lastError?.message?.includes('429')) {
    throw new Error('Daily API quota exceeded. Please try again tomorrow.')
  }
  if (lastError?.message?.includes('Failed to fetch') || lastError?.message?.includes('NetworkError')) {
    throw new Error('Network error. Please check your internet connection.')
  }
  if (lastError?.message?.includes('high demand') || lastError?.message?.includes('overloaded')) {
    throw new Error('All AI models are currently busy. Please try again in a few minutes.')
  }
  
  // Show more specific error for debugging
  throw new Error(`Unable to respond: ${lastError?.message || 'Unknown error'}`)
}

/**
 * Get quick medicine info (optimized for specific medicine queries)
 * @param {string} medicineName - Name of the medicine
 * @returns {Promise<string>} - Medicine information
 */
export const getMedicineInfo = async (medicineName) => {
  const query = `Please provide detailed information about the medicine "${medicineName}" including:
1. What it's used for
2. Common dosage
3. Side effects
4. Important precautions`

  return await chatWithGemini(query)
}
