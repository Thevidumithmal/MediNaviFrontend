# Backend API: Forgot Password

## Endpoint Required

**Endpoint:** `POST /auth/forgot-password`

**Description:** Allows users to request a temporary password by providing their username and email. System validates both match a user, generates a random temporary password, saves it (hashed) to the database, and sends it to the user's email.

**Authentication:** NOT Required (Public endpoint)

**Method:** POST

---

## Request

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Validation Rules:**
- ✅ Both username and email must be provided
- ✅ Username and email must match the same user in the database
- ✅ Email must be valid format
- ✅ Username is case-sensitive
- ✅ Email is case-insensitive

---

## Response

### Success (200 OK):
```json
{
  "message": "Temporary password has been sent to your email"
}
```

### Error (400 Bad Request) - Missing fields:
```json
{
  "message": "Username and email are required"
}
```

### Error (404 Not Found) - No matching user:
```json
{
  "message": "No user found with the provided username and email"
}
```

### Error (500 Internal Server Error) - Email sending failed:
```json
{
  "message": "Failed to send email. Please try again later"
}
```

---

## Backend Implementation Requirements

### 1. Controller Method

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Forgot Password - Generate and send temporary password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        
        // 1. Validate request
        if (request.getUsername() == null || request.getUsername().isEmpty() ||
            request.getEmail() == null || request.getEmail().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Username and email are required"));
        }
        
        // 2. Find user by username AND email (both must match)
        Optional<User> userOpt = userService.findByUsernameAndEmail(
            request.getUsername(), 
            request.getEmail().toLowerCase()
        );
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "No user found with the provided username and email"));
        }
        
        User user = userOpt.get();
        
        // 3. Generate random temporary password (8 characters)
        String tempPassword = generateTemporaryPassword();
        
        // 4. Hash and save the temporary password
        user.setPassword(passwordEncoder.encode(tempPassword));
        userService.save(user);
        
        // 5. Send email with temporary password
        try {
            emailService.sendTemporaryPasswordEmail(
                user.getEmail(), 
                user.getName(),
                tempPassword
            );
        } catch (Exception e) {
            // Log error but don't reveal to user that password was changed
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to send email. Please try again later"));
        }
        
        return ResponseEntity.ok()
            .body(Map.of("message", "Temporary password has been sent to your email"));
    }
    
    /**
     * Generate random temporary password
     * Contains: uppercase, lowercase, numbers (8 chars)
     */
    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder password = new StringBuilder();
        
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return password.toString();
    }
}
```

### 2. Request DTO

```java
package com.yourproject.dto;

public class ForgotPasswordRequest {
    private String username;
    private String email;
    
    // Getters and Setters
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}
```

### 3. UserService Method

Add this method to your UserService:

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Find user by username AND email (both must match)
     */
    public Optional<User> findByUsernameAndEmail(String username, String email) {
        return userRepository.findByUsernameAndEmailIgnoreCase(username, email);
    }
    
    public void save(User user) {
        userRepository.save(user);
    }
}
```

### 4. UserRepository Method

Add this method to your UserRepository:

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Existing methods...
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    
    // New method for forgot password
    @Query("SELECT u FROM User u WHERE u.username = :username AND LOWER(u.email) = LOWER(:email)")
    Optional<User> findByUsernameAndEmailIgnoreCase(
        @Param("username") String username, 
        @Param("email") String email
    );
}
```

### 5. Email Service

You need an EmailService to send the temporary password. If you don't have one, here's a basic implementation using Spring Mail:

#### pom.xml dependency:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

#### application.properties:
```properties
# Email Configuration (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

#### EmailService.java:
```java
package com.yourproject.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    /**
     * Send temporary password email
     */
    public void sendTemporaryPasswordEmail(String toEmail, String userName, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Your Temporary Password - Pharmacy System");
        
        String emailBody = String.format(
            "Dear %s,\n\n" +
            "You requested a password reset for your account.\n\n" +
            "Your temporary password is: %s\n\n" +
            "Please login using this temporary password and change it immediately in your profile settings.\n\n" +
            "If you did not request this password reset, please contact support immediately.\n\n" +
            "Best regards,\n" +
            "Pharmacy System Team",
            userName,
            tempPassword
        );
        
        message.setText(emailBody);
        mailSender.send(message);
    }
}
```

---

## Important Notes

### Security Considerations:
1. ✅ **Rate Limiting:** Implement rate limiting on this endpoint (e.g., max 3 requests per 15 minutes per IP) to prevent abuse
2. ✅ **Logging:** Log all forgot password attempts for security auditing
3. ✅ **Email Verification:** Ensure email is verified during registration
4. ✅ **Same Response:** Return same success message even if user not found (to prevent username enumeration)
5. ✅ **Temporary Password:** Consider adding expiration time for temporary passwords (optional enhancement)

### Alternative Improvement (Optional):
Instead of directly changing the password, you could:
- Generate a password reset token (valid for 1 hour)
- Send email with reset link
- User clicks link and sets new password
- This is more secure but requires additional endpoints

For now, the temporary password approach is simpler and meets your requirements.

---

## Testing the API

### Using Postman/cURL:

```bash
curl -X POST http://localhost:8080/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com"
  }'
```

### Expected Flow:
1. ✅ User submits username + email
2. ✅ Backend validates both match a user
3. ✅ Backend generates random 8-character password
4. ✅ Backend hashes password and saves to User table
5. ✅ Backend sends email with plain temporary password
6. ✅ User receives email
7. ✅ User logs in with temporary password
8. ✅ User changes password in profile section

---

## Summary for Backend Developer

**What to implement:**
1. ✅ Create `POST /auth/forgot-password` endpoint
2. ✅ Create `ForgotPasswordRequest` DTO
3. ✅ Add `findByUsernameAndEmailIgnoreCase()` to UserRepository
4. ✅ Create/update EmailService to send temporary password
5. ✅ Configure email settings in application.properties
6. ✅ Add spring-boot-starter-mail dependency if not exists
7. ✅ Implement password generation logic
8. ✅ Hash and save temporary password to database
9. ✅ Return appropriate success/error messages

**Dependencies needed:**
- spring-boot-starter-mail
- Existing password encoder (BCrypt)
- Existing User entity and repository

**Frontend will handle:**
- Forgot password form UI
- Validation on frontend
- Displaying success/error messages
- Redirecting user to login after success
