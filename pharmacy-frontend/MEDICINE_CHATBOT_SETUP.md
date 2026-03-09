# Medicine Chatbot Setup Guide 💊🤖

## Overview
The Medicine Chatbot is a **FREE** AI-powered assistant that provides information about medicines directly in the customer dashboard. It uses Google's Gemini API (completely free, no credit card required).

## Features ✨
- 💬 Real-time chat interface with medicine information
- 🔒 Restricted to medicine-only responses (won't answer other questions)
- 📊 Provides medicine uses, dosage, side effects, and precautions
- 🎨 Beautiful floating chat UI with animations
- 💾 Conversation history during the session
- 🚀 Fast and responsive

## Setup Instructions

### Step 1: Get Your Free Google Gemini API Key

1. **Visit Google AI Studio**: https://makersuite.google.com/app/apikey
   
2. **Sign in** with your Google account (no credit card required!)

3. **Create API Key:**
   - Click on "Get API Key" button
   - Select "Create API key in new project" or choose an existing project
   - Copy the generated API key

4. **Free Tier Limits:**
   - ✅ 15 requests per minute
   - ✅ 1,500 requests per day
   - ✅ No expiration
   - ✅ No credit card required

### Step 2: Configure Your Application

1. **Create `.env` file** in the project root:
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

2. **Add your API key** to `.env`:
   ```env
   VITE_GEMINI_API_KEY=AIzaSyC...your_actual_key_here
   ```

3. **Save the file** and restart your development server

### Step 3: Test the Chatbot

1. **Start the development server** (if not running):
   ```bash
   npm run dev
   ```

2. **Login as a customer** and go to the dashboard

3. **Look for the floating chat button** in the bottom-right corner (blue/purple gradient with 💊 icon)

4. **Click to open** the chatbot and try asking:
   - "What is Paracetamol used for?"
   - "Tell me about Amoxicillin"
   - "What are the side effects of Ibuprofen?"

## How It Works 🔧

### System Prompt Restriction
The chatbot is configured with a strict system prompt that:
- ✅ ONLY answers questions about medicines and medications
- ❌ Refuses to answer non-medical questions
- ⚠️ Always reminds users to consult healthcare professionals
- 📝 Provides structured, clear information

### Example Interactions

**✅ Good Questions (Chatbot Will Answer):**
```
- What is aspirin used for?
- Tell me about metformin dosage
- Side effects of amoxicillin
- What does omeprazole treat?
- Is paracetamol safe during pregnancy?
```

**❌ Bad Questions (Chatbot Will Decline):**
```
- What's the weather today?
- Tell me a joke
- Who won the World Cup?
- How to cook pasta?
```

### Safety Features
- 🛡️ Content safety filters enabled
- ⚠️ Medical disclaimer on every response
- 🔒 No diagnosis or treatment advice
- 📚 Information-only responses

## API Configuration

### Free Tier Details
| Feature | Limit |
|---------|-------|
| Requests per minute | 15 |
| Requests per day | 1,500 |
| Cost | FREE |
| Credit Card | Not Required |
| Expiration | Never |

### Rate Limiting
If you exceed the free tier limits, the chatbot will show a friendly error message. The limits reset automatically:
- **Per Minute:** Resets every 60 seconds
- **Per Day:** Resets at midnight UTC

## Troubleshooting 🔍

### Issue: "API key not configured"
**Solution:** 
- Make sure `.env` file exists in project root
- Check that `VITE_GEMINI_API_KEY` is set correctly
- Restart the development server after adding the key

### Issue: "Invalid API key"
**Solution:**
- Verify your API key is correct (copy-paste from Google AI Studio)
- Make sure there are no extra spaces or newlines
- Check that the API key is active in your Google Cloud project

### Issue: "Quota exceeded"
**Solution:**
- Wait for the rate limit to reset (1 minute or 1 day)
- Consider implementing request caching if needed
- For production, you may need to upgrade to paid tier

### Issue: Chatbot button not appearing
**Solution:**
- Make sure you're logged in as a **CUSTOMER** role
- Clear browser cache and reload
- Check browser console for errors

## Customization Options 🎨

### Change Chat Position
In `MedicineChatbot.jsx`, modify the button position:
```jsx
// Current: bottom-6 right-6
// Change to: bottom-6 left-6 (for left side)
className="fixed bottom-6 left-6 ..."
```

### Modify System Prompt
In `geminiService.js`, edit the `SYSTEM_PROMPT` constant to change how the chatbot responds.

### Adjust Chat History
In `MedicineChatbot.jsx`, change the context window:
```jsx
// Current: last 6 messages
const chatHistory = messages.slice(-6)
// Change to: last 10 messages
const chatHistory = messages.slice(-10)
```

### Style Customization
The chatbot uses Tailwind CSS classes. Modify colors, sizes, and styles in `MedicineChatbot.jsx`.

## Security Best Practices 🔐

1. **Never commit `.env` to git:**
   ```bash
   # Make sure .env is in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use environment variables in production:**
   - Set `VITE_GEMINI_API_KEY` in your hosting platform
   - Never hardcode API keys in source code

3. **Monitor API usage:**
   - Check your API usage in Google Cloud Console
   - Set up alerts for unusual activity

## Future Enhancements 🚀

Potential improvements you can add:
- 🌐 **Multi-language support** for international users
- 📱 **Voice input** for hands-free interaction
- 💾 **Save favorite responses** for later reference
- 🔔 **Notification system** for important medicine alerts
- 📊 **Analytics dashboard** to track popular medicine queries
- 🔄 **Integration with pharmacy database** for real-time availability

## Support & Resources 📚

- **Google Gemini API Docs:** https://ai.google.dev/docs
- **Gemini API Quickstart:** https://ai.google.dev/tutorials/get_started_web
- **Pricing Information:** https://ai.google.dev/pricing
- **Community Forum:** https://discuss.ai.google.dev/

## License & Attribution

This feature uses:
- **Google Gemini AI** (Free Tier)
- **React** for UI components
- **Tailwind CSS** for styling

---

**Need Help?** Open an issue or contact support!

**Last Updated:** March 5, 2026
