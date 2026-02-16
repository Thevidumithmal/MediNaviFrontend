# Profile Page Debugging Guide

## Issue: Profile data not showing

I've fixed the API endpoint path. Follow these steps to debug:

---

## ✅ **Step 1: Check Browser Console**

1. Open your browser (Chrome/Edge)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Navigate to your profile page
5. Look for these messages:

**Success Example:**
```
Loading customer profile...
API Request: GET http://localhost:8080/api/users/me
API Response: 200 /api/users/me {id: 5, username: "john", ...}
Profile data received: {id: 5, username: "john", name: "John Doe", ...}
```

**Error Example:**
```
Loading customer profile...
API Request: GET http://localhost:8080/api/users/me
API Error Response: {status: 404, url: "/api/users/me", ...}
Failed to load profile: Error: Request failed with status code 404
```

---

## 🔍 **Step 2: Check Network Tab**

1. In Developer Tools, go to **Network** tab
2. Refresh the profile page
3. Find the request to `users/me`
4. Click on it to see details

### **Check Request:**
- **URL:** Should be `http://localhost:8080/api/users/me`
- **Method:** GET
- **Headers:** Authorization header should have Bearer token

### **Check Response:**
- **Status:** Should be 200 OK
- **Response body:** Should contain user data

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: 404 Not Found**
❌ **Problem:** Backend endpoint not created
✅ **Solution:** Verify backend has the endpoint at `/api/users/me`

**Test backend directly:**
```bash
# Get your JWT token from browser (localStorage.getItem('token'))
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### **Issue 2: 401 Unauthorized**
❌ **Problem:** JWT token invalid or missing
✅ **Solution:** 
- Logout and login again to get a fresh token
- Check if backend JWT validation is working
- Verify token is being sent in Authorization header

### **Issue 3: 500 Internal Server Error**
❌ **Problem:** Backend code error
✅ **Solution:** Check backend console/logs for error details

### **Issue 4: CORS Error**
❌ **Problem:** Backend CORS not configured
✅ **Solution:** Add CORS configuration in Spring Boot:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173"); // Vite dev server
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### **Issue 5: Backend Not Running**
❌ **Problem:** Spring Boot server not started
✅ **Solution:** Start your backend server

```bash
# In backend directory
./mvnw spring-boot:run
# or
java -jar target/pharmacy-backend.jar
```

### **Issue 6: Wrong Port**
❌ **Problem:** Backend running on different port
✅ **Solution:** Check if backend is on port 8080 or update frontend:

Create `.env` file in frontend root:
```
VITE_API_URL=http://localhost:YOUR_BACKEND_PORT
```

---

## 🧪 **Step 3: Test Backend Endpoint Directly**

### **Option A: Using Browser Console**

Open browser console and run:
```javascript
// Get your token
const token = localStorage.getItem('token')
console.log('Token:', token)

// Test API call
fetch('http://localhost:8080/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('Profile Data:', data))
.catch(err => console.error('Error:', err))
```

### **Option B: Using curl**

```bash
# Replace YOUR_TOKEN with actual token from localStorage
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### **Expected Response:**
```json
{
  "id": 5,
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "pharmacyId": null,
  "pharmacyName": null
}
```

---

## 📋 **Backend Checklist**

Verify these in your Spring Boot backend:

- [ ] Controller method exists at `/api/users/me`
- [ ] Method has `@GetMapping("/api/users/me")` annotation
- [ ] Security config allows authenticated access to this endpoint
- [ ] UserDTO includes: `username`, `phone`, `pharmacyName` fields
- [ ] For PHARMACY users, code fetches pharmacy name from database
- [ ] Backend server is running on port 8080
- [ ] No errors in backend console

---

## 🔧 **Quick Backend Verification**

Add this controller to test:

```java
@RestController
@RequestMapping("/api")
public class TestController {
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend is working!");
    }
    
    @GetMapping("/users/me")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
        // Add debug logging
        System.out.println("getCurrentUserProfile called by: " + authentication.getName());
        
        // Your implementation here...
        
        return ResponseEntity.ok(profileDTO);
    }
}
```

Then test:
```bash
curl http://localhost:8080/api/test
# Should return: "Backend is working!"
```

---

## 📱 **What You Should See**

### **After Logging In:**

The login response should include:
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 5,
    "username": "johndoe",      // ✅ Should be here
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",     // ✅ Should be here
    "role": "CUSTOMER",
    "pharmacyId": null,
    "pharmacyName": null
  }
}
```

### **On Profile Page:**

You should see:
- ✅ Username
- ✅ Name
- ✅ Email
- ✅ Phone Number
- ✅ Role Badge
- ✅ Account Status
- ✅ Pharmacy Name (for pharmacy users)

---

## 💡 **Still Not Working?**

Send me the following information:

1. **Browser Console Output** (copy all messages)
2. **Network Tab** - Screenshot of the `/api/users/me` request
3. **Backend Logs** - Any errors when accessing the endpoint
4. **Endpoint Test Result** - Result of curl command above

This will help identify the exact issue!
