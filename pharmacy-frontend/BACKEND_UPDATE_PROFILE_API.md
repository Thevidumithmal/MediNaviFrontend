# Backend API: Update User Profile

## Endpoint Required

**Endpoint:** `PUT /api/users/me` or `PATCH /api/users/me`

**Description:** Allows authenticated users to update their own profile (username and phone number only)

**Authentication:** Required (JWT token)

**Method:** PUT or PATCH

---

## Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "newusername123",
  "phone": "+94771234567"
}
```

**Validation Rules:**
- ✅ Username: 3-50 characters, alphanumeric and underscores only
- ✅ Username must be unique (check if already exists)
- ✅ Phone: Valid phone format (optional field, can be null)
- ❌ Users CANNOT change: email, role, status, password (use separate endpoints)

---

## Response

### Success (200 OK):
```json
{
  "id": 5,
  "username": "newusername123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "pharmacyId": null,
  "pharmacyName": null
}
```

### Error (400 Bad Request) - Username taken:
```json
{
  "message": "Username already exists",
  "field": "username"
}
```

### Error (400 Bad Request) - Invalid phone:
```json
{
  "message": "Invalid phone number format",
  "field": "phone"
}
```

### Error (401 Unauthorized):
```json
{
  "message": "Unauthorized"
}
```

---

## Spring Boot Implementation Example

### Controller

```java
@RestController
@RequestMapping("/api")
public class UserProfileController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PharmacyService pharmacyService;
    
    /**
     * Get current user profile
     */
    @GetMapping("/users/me")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileDTO profile = mapToProfileDTO(user);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Update current user profile (username and phone only)
     */
    @PutMapping("/users/me")
    public ResponseEntity<UserProfileDTO> updateCurrentUserProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        
        String currentUsername = authentication.getName();
        User user = userService.findByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate username if changed
        if (request.getUsername() != null && 
            !request.getUsername().equals(user.getUsername())) {
            
            // Check if new username is already taken
            if (userService.findByUsername(request.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username already exists");
            }
            
            // Validate username format (3-50 chars, alphanumeric + underscore)
            if (!request.getUsername().matches("^[a-zA-Z0-9_]{3,50}$")) {
                throw new IllegalArgumentException("Invalid username format");
            }
            
            user.setUsername(request.getUsername());
        }
        
        // Update phone (can be null)
        if (request.getPhone() != null) {
            // Optional: Validate phone format
            if (!request.getPhone().isEmpty() && 
                !request.getPhone().matches("^(\\+94|0)?[0-9]{9,10}$")) {
                throw new IllegalArgumentException("Invalid phone number format");
            }
            user.setPhone(request.getPhone());
        }
        
        // Save updated user
        user = userService.save(user);
        
        // Return updated profile
        UserProfileDTO profile = mapToProfileDTO(user);
        return ResponseEntity.ok(profile);
    }
    
    private UserProfileDTO mapToProfileDTO(User user) {
        UserProfileDTO profile = new UserProfileDTO();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setName(user.getName());
        profile.setEmail(user.getEmail());
        profile.setPhone(user.getPhone());
        profile.setRole(user.getRole());
        profile.setStatus(user.getStatus());
        profile.setPharmacyId(user.getPharmacyId());
        
        // For pharmacy users, include pharmacy name
        if ("PHARMACY".equals(user.getRole()) && user.getPharmacyId() != null) {
            Pharmacy pharmacy = pharmacyService.findById(user.getPharmacyId())
                .orElse(null);
            if (pharmacy != null) {
                profile.setPharmacyName(pharmacy.getName());
            }
        }
        
        profile.setCreatedAt(user.getCreatedAt());
        profile.setUpdatedAt(user.getUpdatedAt());
        
        return profile;
    }
}
```

### Request DTO

```java
package com.example.pharmacybackend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;  // New username (optional)
    private String phone;     // New phone (optional, can be null)
    
    // DO NOT include: email, password, role, status
    // Those should have separate endpoints for security
}
```

### Service Method

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public User save(User user) {
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
```

---

## Security Configuration

Ensure the endpoint is protected:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/register", "/auth/login").permitAll()
                .requestMatchers("/api/users/me").authenticated()  // ⭐ Both GET and PUT
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

### Test 1: Update Username
```bash
curl -X PUT http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername",
    "phone": "+94771234567"
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": 5,
  "username": "newusername",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "role": "CUSTOMER",
  "status": "ACTIVE"
}
```

### Test 2: Try Duplicate Username (Should Fail)
```bash
curl -X PUT http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "existinguser",
    "phone": "+94771234567"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Username already exists"
}
```

### Test 3: Update Only Phone
```bash
curl -X PUT http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+94779999999"
  }'
```

---

## Important Notes

### Security Considerations:
1. ✅ Users can only update their **own** profile (authenticated user from JWT)
2. ✅ Username must be unique - check database before updating
3. ✅ Cannot change: email, role, status, password (security risk)
4. ✅ Validate input data (length, format, special characters)
5. ✅ Return updated profile data after successful update

### Business Rules:
- Username change is allowed (must be unique)
- Phone number change is allowed (can be null/empty)
- Name, email, role changes should require admin approval or separate endpoints
- Password change should be a separate endpoint with current password verification

---

## Checklist for Backend Developer

- [ ] Create `UpdateProfileRequest` DTO with `username` and `phone` fields
- [ ] Add `PUT /api/users/me` endpoint in controller
- [ ] Validate username uniqueness before updating
- [ ] Validate username format (3-50 chars, alphanumeric + underscore)
- [ ] Validate phone format (optional)
- [ ] Update `updatedAt` timestamp when saving
- [ ] Return complete updated profile in response
- [ ] Add proper error handling with meaningful messages
- [ ] Test with all user types (CUSTOMER, PHARMACY, ADMIN)
- [ ] Ensure pharmacy name is included for pharmacy users in response

---

## Summary

**New API Endpoint:**
- `PUT /api/users/me` - Update authenticated user's profile

**Allowed Updates:**
- ✅ Username (must be unique)
- ✅ Phone number

**Not Allowed:**
- ❌ Email (requires verification)
- ❌ Name (optional - or can be added if needed)
- ❌ Password (use separate change password endpoint)
- ❌ Role (security - only admin can change)
- ❌ Status (security - only admin can change)

This keeps the profile update secure and simple!
