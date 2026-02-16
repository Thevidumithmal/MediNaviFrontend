# Backend Integration Debug Guide

## Common Issues & Solutions

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console and Network tabs for errors:
- **401 Unauthorized**: Authentication/token issues
- **403 Forbidden**: Role/permission issues  
- **CORS errors**: Backend CORS not configured
- **404 Not Found**: Wrong API URL or endpoints don't exist
- **500 Internal Server Error**: Backend code errors

### 2. Backend CORS Configuration

Your Spring Boot backend NEEDS CORS configuration. Add this class:

```java
package com.example.pharmacybackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### 3. Security Configuration

Make sure your SecurityConfig allows /admin/** for ADMIN role:

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
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 4. JWT Token Role Mapping

Make sure your JWT token contains the role with "ROLE_" prefix:

```java
// In your JWT service/auth service
private Claims extractAllClaims(String token) {
    return Jws.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
}

// When creating token
public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", "ROLE_" + user.getRole()); // Make sure ROLE_ prefix is added!
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(user.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

### 5. DTO Structure Check

Make sure your AdminStatsDTO matches what frontend expects:

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsDTO {
    private Long totalUsers;
    private Long activeUsers;
    private Long totalPharmacies;
    private Long totalMedicines;
    private List<UserRoleCount> usersByRole;
    private List<PharmacyRegionCount> pharmaciesByRegion;
    private List<TopMedicine> topMedicines;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserRoleCount {
        private String role;
        private Long count;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PharmacyRegionCount {
        private String region;
        private Long count;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopMedicine {
        private String name;
        private Long totalStock;
        private Long pharmacyCount;
    }
}
```

### 6. Frontend API URL Configuration

Make sure your backend is running on port 8080. Check:

1. Backend `application.properties`:
```properties
server.port=8080
```

2. Frontend dev server is on port 5173 (Vite default)

3. Test backend directly:
```
http://localhost:8080/admin/stats
```

### 7. Testing Steps

1. **Start Backend**: Run your Spring Boot app on port 8080
2. **Check Health**: Visit http://localhost:8080/actuator/health (if actuator enabled)
3. **Login**: Use frontend to login as admin
4. **Check Token**: 
   - Open browser DevTools > Application > Local Storage
   - Verify `token` exists
   - Decode it at https://jwt.io to check the role claim
5. **Check Network Tab**: 
   - Go to admin dashboard
   - Check requests to `/admin/stats`
   - Look for errors in response

### 8. Database Check

Make sure you have data in your database:

```sql
-- Check users
SELECT * FROM users WHERE role = 'ADMIN';

-- Check pharmacies
SELECT COUNT(*) FROM pharmacies;

-- Check medicines
SELECT COUNT(*) FROM medicines;
```

### 9. Create Initial Admin User

If you don't have an admin user, create one:

```java
// In your main application or CommandLineRunner
@Bean
CommandLineRunner initDatabase(UserRepository userRepo, PasswordEncoder encoder) {
    return args -> {
        if (userRepo.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin123"));
            admin.setName("System Admin");
            admin.setEmail("admin@pharmacy.com");
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");
            userRepo.save(admin);
            System.out.println("Admin user created: admin/admin123");
        }
    };
}
```

### 10. Common Backend Errors

**Error: No value present**
- Service method is returning Optional.orElseThrow() but no data exists
- Solution: Return empty lists/0 values instead of throwing

**Error: 403 Forbidden**
- Role prefix missing (needs ROLE_ADMIN not just ADMIN)
- Solution: Add "ROLE_" prefix in JWT or use hasAuthority("ADMIN")

**Error: Method not allowed**
- CORS preflight OPTIONS request failing
- Solution: Add CORS config as shown above

## Quick Test Commands

Test backend endpoints with curl:

```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get stats (replace TOKEN with actual token)
curl -X GET http://localhost:8080/admin/stats \
  -H "Authorization: Bearer TOKEN"

# Create user
curl -X POST http://localhost:8080/admin/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123","name":"Test User","role":"CUSTOMER"}'
```
