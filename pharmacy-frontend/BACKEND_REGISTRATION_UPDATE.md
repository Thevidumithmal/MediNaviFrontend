# Backend Registration Update - Customer Only

## Changes Made in Frontend ✅

The registration page now:
- Only allows **CUSTOMER** registration
- Removed role selection dropdown
- Removed pharmacy details fields
- Simplified to: Name, Email, Password, Phone (optional)
- Always sends `role: "CUSTOMER"` to backend

## Required Backend Changes

### 1. Update AuthService.register() Method

Simplify the registration to only handle customers:

```java
@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
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
        
        // ⭐ SECURITY: Force role to CUSTOMER for public registration
        // Ignore any role sent from frontend
        String safeRole = "CUSTOMER";
        
        // Create new customer user
        User user = new User();
        user.setUsername(request.getUsername() != null ? request.getUsername() : request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(safeRole);  // Always CUSTOMER
        user.setStatus("ACTIVE");
        
        // Save user
        user = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        // Map to DTO
        UserDTO userDto = mapToUserDTO(user);
        
        return new AuthResponse(token, userDto);
    }
    
    private UserDTO mapToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        return dto;
    }
}
```

### 2. Update RegisterRequest DTO

Remove pharmacy-related fields:

```java
package com.example.pharmacybackend.dto.auth;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;  // Optional, will use email if not provided
    private String name;
    private String email;
    private String password;
    private String phone;
    
    // ⭐ REMOVED: No need for role, pharmacyName, address, etc.
    // Registration endpoint only creates customers
}
```

### 3. Security: Validate Role in Registration

Even if someone tries to send role in the request, ignore it:

```java
@Transactional
public AuthResponse register(RegisterRequest request) {
    // ... validation code ...
    
    // ⭐ CRITICAL SECURITY: Always set role to CUSTOMER
    // Even if request contains a different role, ignore it
    // Only admins can create PHARMACY and ADMIN users via /admin/users endpoint
    
    user.setRole("CUSTOMER");
    
    // ... rest of the code ...
}
```

### 4. Update AuthController

Make sure the endpoint is public and doesn't check roles:

```java
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    // ⭐ Public endpoint - no authentication required
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

### 5. Security Configuration

Ensure registration endpoint is public:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/register", "/auth/login").permitAll()  // ⭐ Public
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/pharmacy/**").hasRole("PHARMACY")
                .requestMatchers("/customers/**").hasRole("CUSTOMER")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## Summary of Changes

### What Was Removed:
- ❌ Pharmacy user self-registration
- ❌ Pharmacy creation during registration
- ❌ Role selection in registration
- ❌ Admin user self-registration

### What Remains:
- ✅ Customer self-registration (public)
- ✅ Admin creates pharmacy users via `/admin/users`
- ✅ Admin creates pharmacies via `/admin/pharmacies`
- ✅ Admin creates any user type via `/admin/users`

### Security Benefits:
1. **Prevents privilege escalation** - Users can't register as ADMIN or PHARMACY
2. **Centralized control** - Only admins can create non-customer accounts
3. **Simpler registration** - Just basic customer information needed
4. **Better data quality** - Pharmacies are properly managed by admins

## Testing Steps

### 1. Test Customer Registration (Should Work)
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Customer",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+94771234567"
  }'
```

Expected: Success, user created with role=CUSTOMER

### 2. Test Security - Try to Register as Admin (Should Fail or Ignore)
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacker",
    "email": "hacker@example.com",
    "password": "password123",
    "role": "ADMIN"
  }'
```

Expected: User created but role is CUSTOMER (role field ignored)

### 3. Test Admin Creates Pharmacy User (Should Work)
- Login as admin
- Go to Admin → Users
- Create user with PHARMACY role
- Select pharmacy from dropdown
- Submit

Expected: Pharmacy user created successfully

### 4. Test Admin Creates Pharmacy (Should Work)
- Login as admin
- Go to Admin → Pharmacies
- Add new pharmacy
- Submit

Expected: Pharmacy created successfully

## Database Cleanup (Optional)

If you want to remove old pharmacy data created via registration:

```sql
-- View pharmacies without proper admin creation
SELECT * FROM pharmacies WHERE owner_id IS NOT NULL;

-- If you want to keep only admin-created pharmacies:
-- BE CAREFUL: This will delete pharmacies created during registration
-- DELETE FROM pharmacies WHERE owner_id IS NOT NULL;
```

## API Endpoints Summary

| Endpoint | Access | Purpose |
|----------|--------|---------|
| `POST /auth/register` | Public | Customer registration only |
| `POST /auth/login` | Public | All users login |
| `POST /admin/users` | Admin | Create any user type |
| `POST /admin/pharmacies` | Admin | Create pharmacies |
| `GET /admin/pharmacies` | Admin | List all pharmacies |
| `GET /admin/users` | Admin | List all users |

## Migration Notes

If you have existing pharmacy users created via registration:
1. They will continue to work (no breaking changes)
2. New pharmacy users must be created by admin
3. Optionally run a script to link existing pharmacy users properly
