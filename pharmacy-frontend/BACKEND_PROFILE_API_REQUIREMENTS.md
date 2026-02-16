# Backend API Requirements for User Profile Feature

## Problem
The user profile pages are not showing complete user information (username, phone, etc.) - only email is displayed. Additionally, pharmacy users need to see their pharmacy name instead of just the pharmacy ID.

---

## Required Backend APIs

### 1. Get Current User Profile (Authenticated User)

**Endpoint:** `GET /api/users/me` or `GET /api/profile`

**Description:** Returns the complete profile information of the currently logged-in user

**Authentication:** Required (JWT token in Authorization header)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200 OK):**
```json
{
  "id": 5,
  "username": "johndoe123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "pharmacyId": null,
  "pharmacyName": null,
  "createdAt": "2026-01-15T10:30:00",
  "updatedAt": "2026-02-10T14:20:00"
}
```

**Response for PHARMACY user:**
```json
{
  "id": 12,
  "username": "pharmacy_user",
  "name": "Sarah Smith",
  "email": "sarah@pharmacy.com",
  "phone": "+94712345678",
  "role": "PHARMACY",
  "status": "ACTIVE",
  "pharmacyId": 3,
  "pharmacyName": "City Center Pharmacy",  // ⭐ Include pharmacy name
  "createdAt": "2026-01-20T09:15:00",
  "updatedAt": "2026-02-12T11:45:00"
}
```

**Response for ADMIN user:**
```json
{
  "id": 1,
  "username": "admin",
  "name": "Admin User",
  "email": "admin@medinavi.com",
  "phone": "+94711111111",
  "role": "ADMIN",
  "status": "ACTIVE",
  "pharmacyId": null,
  "pharmacyName": null,
  "createdAt": "2025-12-01T08:00:00",
  "updatedAt": "2026-02-15T16:30:00"
}
```

---

### 2. Update Login Response to Include All User Details

**Endpoint:** `POST /auth/login` (Existing - needs update)

**Current Issue:** Login response might not include username, phone, and pharmacy name

**Updated Response Format:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "username": "johndoe123",        // ⭐ Include this
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",          // ⭐ Include this
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "pharmacyId": null,
    "pharmacyName": null              // ⭐ For pharmacy users, include pharmacy name
  }
}
```

---

## Implementation Guide

### Spring Boot Controller Example

```java
@RestController
@RequestMapping("/api")
public class UserProfileController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PharmacyService pharmacyService;
    
    /**
     * Get current authenticated user's profile
     */
    @GetMapping("/users/me")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
        String username = authentication.getName(); // or get from JWT
        User user = userService.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileDTO profile = new UserProfileDTO();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setName(user.getName());
        profile.setEmail(user.getEmail());
        profile.setPhone(user.getPhone());
        profile.setRole(user.getRole());
        profile.setStatus(user.getStatus());
        profile.setPharmacyId(user.getPharmacyId());
        
        // If user is a pharmacy user, fetch and include pharmacy name
        if ("PHARMACY".equals(user.getRole()) && user.getPharmacyId() != null) {
            Pharmacy pharmacy = pharmacyService.findById(user.getPharmacyId())
                .orElse(null);
            if (pharmacy != null) {
                profile.setPharmacyName(pharmacy.getName());
            }
        }
        
        profile.setCreatedAt(user.getCreatedAt());
        profile.setUpdatedAt(user.getUpdatedAt());
        
        return ResponseEntity.ok(profile);
    }
}
```

### DTO Class

```java
package com.example.pharmacybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserProfileDTO {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private Long pharmacyId;
    private String pharmacyName;  // For PHARMACY role users
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Update AuthService.login() Method

```java
@Service
public class AuthService {
    
    public AuthResponse login(LoginRequest request) {
        // ... authentication logic ...
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate token
        String token = jwtService.generateToken(user);
        
        // Build complete user DTO
        UserDTO userDto = new UserDTO();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());  // ⭐ Include
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setPhone(user.getPhone());        // ⭐ Include
        userDto.setRole(user.getRole());
        userDto.setStatus(user.getStatus());
        userDto.setPharmacyId(user.getPharmacyId());
        
        // ⭐ For pharmacy users, include pharmacy name
        if ("PHARMACY".equals(user.getRole()) && user.getPharmacyId() != null) {
            Pharmacy pharmacy = pharmacyRepository.findById(user.getPharmacyId())
                .orElse(null);
            if (pharmacy != null) {
                userDto.setPharmacyName(pharmacy.getName());
            }
        }
        
        return new AuthResponse(token, userDto);
    }
}
```

### Update UserDTO

```java
package com.example.pharmacybackend.dto.auth;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;      // ⭐ Add this field
    private String name;
    private String email;
    private String phone;         // ⭐ Add this field
    private String role;
    private String status;
    private Long pharmacyId;
    private String pharmacyName;  // ⭐ Add this field for pharmacy users
}
```

---

## Security Configuration

Make sure the `/api/users/me` endpoint is protected and requires authentication:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/register", "/auth/login").permitAll()
                .requestMatchers("/api/users/me", "/api/profile").authenticated()  // ⭐ Add this
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            // ... rest of configuration
        
        return http.build();
    }
}
```

---

## Testing

### Test 1: Get Profile as Customer
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <customer_jwt_token>"
```

**Expected Response:**
```json
{
  "id": 5,
  "username": "customer1",
  "name": "John Customer",
  "email": "customer@example.com",
  "phone": "+94771234567",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "pharmacyId": null,
  "pharmacyName": null
}
```

### Test 2: Get Profile as Pharmacy User
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <pharmacy_jwt_token>"
```

**Expected Response:**
```json
{
  "id": 12,
  "username": "pharmacy_user",
  "name": "Sarah Smith",
  "email": "sarah@pharmacy.com",
  "phone": "+94712345678",
  "role": "PHARMACY",
  "status": "ACTIVE",
  "pharmacyId": 3,
  "pharmacyName": "City Center Pharmacy"
}
```

### Test 3: Login and Check Response
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pharmacy@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 12,
    "username": "pharmacy_user",
    "name": "Sarah Smith",
    "email": "pharmacy@example.com",
    "phone": "+94712345678",
    "role": "PHARMACY",
    "status": "ACTIVE",
    "pharmacyId": 3,
    "pharmacyName": "City Center Pharmacy"
  }
}
```

---

## Frontend Integration

Once the backend APIs are ready, the frontend will:

1. Call `GET /api/users/me` when loading profile pages
2. Use the login response which now includes complete user info
3. Display pharmacy name instead of pharmacy ID for pharmacy users

---

## Checklist for Backend Developer

- [ ] Add `username` field to `UserDTO`
- [ ] Add `phone` field to `UserDTO`
- [ ] Add `pharmacyName` field to `UserDTO`
- [ ] Update `AuthService.login()` to include all user fields in response
- [ ] For pharmacy users, fetch and include pharmacy name in login response
- [ ] Create `GET /api/users/me` endpoint
- [ ] Return complete user profile with pharmacy name (for pharmacy users)
- [ ] Ensure endpoint requires JWT authentication
- [ ] Test all three user types (CUSTOMER, PHARMACY, ADMIN)
- [ ] Verify pharmacy name is correctly populated for pharmacy users

---

## Summary

**Two main changes needed:**

1. **Update Login Response** - Include username, phone, and pharmacyName fields
2. **Create Profile API** - `GET /api/users/me` to fetch complete user details

This will enable the frontend profile pages to display all user information correctly!
