# Customer Registration Issue - Testing & Fix Guide

## Problem Summary
- **Customer Registration**: Username and phone NOT saving to database ❌
- **Admin User Creation**: Username and phone saving correctly ✅

## Root Cause
The frontend is NOW correctly sending `username` and `phone` in the registration payload, BUT the backend's `/auth/register` endpoint is not properly configured to accept and save these fields.

## Different Endpoints
1. **Customer Registration** → Uses `/auth/register` endpoint (PUBLIC)
2. **Admin User Creation** → Uses `/admin/users` endpoint (ADMIN ONLY)

The `/admin/users` endpoint works fine, but `/auth/register` needs to be updated in the backend.

---

## Frontend Changes (ALREADY COMPLETED ✅)

The `RegisterPage.jsx` has been updated to send:
```javascript
{
  username: "johndoe123",      // ✅ NOW INCLUDED
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  phone: "+94771234567",       // ✅ ALREADY INCLUDED
  role: "CUSTOMER"
}
```

---

## Backend Changes Required (NEEDS TO BE DONE ⚠️)

### 1. Update `RegisterRequest.java` DTO

**Location**: `src/main/java/com/example/pharmacybackend/dto/auth/RegisterRequest.java`

```java
package com.example.pharmacybackend.dto.auth;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;  // ⭐ ADD THIS FIELD
    private String name;
    private String email;
    private String password;
    private String phone;      // ⭐ MAKE SURE THIS EXISTS
    
    // DO NOT INCLUDE: role, pharmacyName, address
    // Registration endpoint only creates customers
}
```

### 2. Update `AuthService.java` - register() Method

**Location**: `src/main/java/com/example/pharmacybackend/service/AuthService.java`

```java
@Transactional
public AuthResponse register(RegisterRequest request) {
    // Validate email uniqueness
    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new IllegalArgumentException("Email already registered");
    }
    
    // Validate username if provided
    if (request.getUsername() != null && 
        userRepository.findByUsername(request.getUsername()).isPresent()) {
        throw new IllegalArgumentException("Username already exists");
    }
    
    // Create new customer user
    User user = new User();
    
    // ⭐ CRITICAL: Set username from request (fallback to email if not provided)
    user.setUsername(request.getUsername() != null ? request.getUsername() : request.getEmail());
    
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    
    // ⭐ CRITICAL: Set phone from request
    user.setPhone(request.getPhone());
    
    // Force role to CUSTOMER for security
    user.setRole("CUSTOMER");
    user.setStatus("ACTIVE");
    
    // Save user
    user = userRepository.save(user);
    
    // Generate JWT token
    String token = jwtService.generateToken(user);
    
    // Map to DTO
    UserDTO userDto = mapToUserDTO(user);
    
    return new AuthResponse(token, userDto);
}
```

### 3. Check Database Schema

Make sure the `users` table has these columns:
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,  -- ⭐ Must exist
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),                      -- ⭐ Must exist
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50),
    pharmacy_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Testing Instructions

### Test 1: Verify Frontend Payload (Browser Developer Tools)

1. Open the registration page in browser
2. Open Developer Tools (F12)
3. Go to **Network** tab
4. Fill in the registration form:
   - Username: `testuser123`
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Phone: `0771234567`
5. Click **Register**
6. In Network tab, find the `/auth/register` request
7. Check the **Payload** tab

**Expected Payload:**
```json
{
  "username": "testuser123",
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "0771234567",
  "role": "CUSTOMER"
}
```

### Test 2: Check Database After Registration

After successful registration, check the database:

```sql
SELECT id, username, name, email, phone, role 
FROM users 
WHERE email = 'test@example.com';
```

**Expected Result:**
| id | username | name | email | phone | role |
|----|----------|------|-------|-------|------|
| X | testuser123 | Test User | test@example.com | 0771234567 | CUSTOMER |

**If username or phone is NULL**, the backend is not saving them properly!

### Test 3: Compare with Admin-Created User

1. Login as admin
2. Go to Admin → Users
3. Create a new customer with same details
4. Check database again

If admin-created users have username/phone but customer registrations don't, it confirms the `/auth/register` endpoint needs updating.

---

## Quick Backend Fix Checklist

- [ ] Add `username` field to `RegisterRequest.java`
- [ ] Ensure `phone` field exists in `RegisterRequest.java`
- [ ] Update `AuthService.register()` to use `request.getUsername()`
- [ ] Update `AuthService.register()` to use `request.getPhone()`
- [ ] Verify `User` entity has `username` and `phone` fields
- [ ] Verify database `users` table has `username` and `phone` columns
- [ ] Test customer registration
- [ ] Verify data is saved in database

---

## Common Backend Mistakes

### Mistake 1: Username not in DTO
```java
// ❌ WRONG
public class RegisterRequest {
    private String name;
    private String email;
    // Missing username field!
}

// ✅ CORRECT
public class RegisterRequest {
    private String username;  // Add this!
    private String name;
    private String email;
}
```

### Mistake 2: Not using username from request
```java
// ❌ WRONG
user.setUsername(request.getEmail()); // Always uses email

// ✅ CORRECT
user.setUsername(request.getUsername() != null ? request.getUsername() : request.getEmail());
```

### Mistake 3: Not saving phone
```java
// ❌ WRONG
// user.setPhone() is missing!

// ✅ CORRECT
user.setPhone(request.getPhone());
```

---

## Summary

✅ **Frontend is now correct** - Sends username and phone in payload  
⚠️ **Backend needs updates** - `/auth/register` endpoint must be modified  
✅ **Admin endpoint works** - `/admin/users` already handles username and phone correctly

The backend developer should follow the **BACKEND_REGISTRATION_UPDATE.md** document to complete the necessary changes.
