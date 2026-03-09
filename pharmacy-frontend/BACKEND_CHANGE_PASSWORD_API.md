# Backend API: Change User Password

## Endpoint Required

**Endpoint:** `PUT /api/users/me/password`

**Description:** Allows authenticated users to change their own password by providing current password and new password

**Authentication:** Required (JWT token)

**Method:** PUT

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
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword456"
}
```

**Validation Rules:**
- ✅ Current password must be provided and match the user's existing password
- ✅ New password: Minimum 6 characters (or your custom requirements)
- ✅ New password must be different from current password
- ✅ User must be authenticated (from JWT token)

---

## Response

### Success (200 OK):
```json
{
  "message": "Password changed successfully"
}
```

### Error (400 Bad Request) - Current password incorrect:
```json
{
  "message": "Current password is incorrect"
}
```

### Error (400 Bad Request) - Weak new password:
```json
{
  "message": "Password must be at least 6 characters"
}
```

### Error (400 Bad Request) - Same password:
```json
{
  "message": "New password must be different from current password"
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
@RequestMapping("/api/users")
public class UserProfileController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Change user password
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        User user = userService.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Current password is incorrect"));
        }
        
        // Validate new password
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Password must be at least 6 characters"));
        }
        
        // Check if new password is same as current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "New password must be different from current password"));
        }
        
        // Hash and update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userService.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
```

### Request DTO

```java
package com.example.pharmacybackend.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String currentPassword;  // Must match user's current password
    private String newPassword;       // New password (min 6 chars)
    
    // Validation annotations (optional)
    // @NotBlank(message = "Current password is required")
    // @Size(min = 6, message = "New password must be at least 6 characters")
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
                .requestMatchers("/api/users/me/**").authenticated()  // ⭐ Require auth
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

### Test 1: Change password successfully
```bash
curl -X PUT http://localhost:8080/api/users/me/password \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123",
    "newPassword": "NewSecurePassword456"
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

### Test 2: Wrong current password
```bash
curl -X PUT http://localhost:8080/api/users/me/password \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "WrongPassword",
    "newPassword": "NewSecurePassword456"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Current password is incorrect"
}
```

### Test 3: Weak new password
```bash
curl -X PUT http://localhost:8080/api/users/me/password \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123",
    "newPassword": "123"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Password must be at least 6 characters"
}
```

### Test 4: Login with new password
```bash
# After changing password, try logging in with new password
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "NewSecurePassword456"
  }'
```

**Expected:** Should succeed and return JWT token

---

## Password Encryption

Make sure you have PasswordEncoder configured:

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## Security Best Practices

### ✅ Good Practices Implemented:
1. **Require Current Password** - Prevents unauthorized password changes if device is left unlocked
2. **Hash Passwords** - Never store plaintext passwords (use BCrypt)
3. **Verify Current Password** - Use `passwordEncoder.matches()` to check
4. **Minimum Password Length** - Enforce at least 6 characters (or stronger)
5. **Prevent Reuse** - Check new password is different from current
6. **Audit Trail** - Update `updatedAt` timestamp

### 🔒 Additional Security Measures (Optional):
1. **Password Strength Check** - Require uppercase, lowercase, numbers, special chars
2. **Rate Limiting** - Prevent brute force attacks (max 5 attempts per hour)
3. **Logout All Sessions** - Invalidate existing tokens after password change
4. **Email Notification** - Send confirmation email when password is changed
5. **Password History** - Prevent reusing last 3 passwords
6. **Two-Factor Authentication** - Require 2FA before password change

---

## Enhanced Password Validation (Optional)

```java
public class PasswordValidator {
    
    public static boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        // At least one uppercase, one lowercase, one digit, one special char
        String pattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(pattern);
    }
}
```

Usage in controller:
```java
if (!PasswordValidator.isStrongPassword(request.getNewPassword())) {
    return ResponseEntity.badRequest()
        .body(Map.of("message", 
            "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"));
}
```

---

## Database Schema

Ensure your `users` table has these columns:

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- BCrypt hash (60 chars)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Important Notes

### User Experience:
- ✅ Frontend validates password match (new vs confirm)
- ✅ Frontend enforces minimum 6 characters
- ✅ Backend verifies current password is correct
- ✅ Success message confirms password change
- ✅ User doesn't get logged out (JWT remains valid)

### Security Considerations:
1. ⚠️ **Never log passwords** - Not even in encrypted form
2. ⚠️ **Always hash passwords** - Use BCrypt or Argon2
3. ⚠️ **Validate on backend** - Never trust frontend validation alone
4. ⚠️ **Use HTTPS** - Passwords must be encrypted in transit
5. ⚠️ **Consider 2FA** - Extra layer of security for sensitive operations

---

## Checklist for Backend Developer

- [ ] Create `ChangePasswordRequest` DTO with `currentPassword` and `newPassword` fields
- [ ] Add `PUT /api/users/me/password` endpoint in controller
- [ ] Verify current password using `passwordEncoder.matches()`
- [ ] Validate new password length (min 6 characters)
- [ ] Check new password is different from current
- [ ] Hash new password using `passwordEncoder.encode()`
- [ ] Update user password in database
- [ ] Return success message
- [ ] Add proper error handling for incorrect current password
- [ ] Test with all three user types (CUSTOMER, PHARMACY, ADMIN)
- [ ] Consider adding password strength requirements
- [ ] Optional: Send email notification on password change

---

## Summary

**New API Endpoint:**
- `PUT /api/users/me/password` - Change authenticated user's password

**Required Fields:**
- `currentPassword` - Must match user's existing password
- `newPassword` - New password (minimum 6 characters)

**Security:**
- ✅ Current password verification prevents unauthorized changes
- ✅ BCrypt hashing protects passwords
- ✅ JWT authentication ensures only logged-in users can change password
- ✅ Works for all user types: Customer, Pharmacy, Admin

**Frontend Changes:**
- ✅ Already implemented! Password change form added to all profile pages
- ✅ Show/hide password toggles for all fields
- ✅ Client-side validation (password match, minimum length)
- ✅ Success/error notifications with SweetAlert

Once you implement this endpoint, users will be able to change their passwords securely! 🔐
