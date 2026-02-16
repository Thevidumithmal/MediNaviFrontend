# Backend Changes for Pharmacy User Creation

## Issue
When admin creates a user with PHARMACY role, backend requires `pharmacyId` but frontend wasn't sending it.

## Frontend Changes (COMPLETED ✅)
- Added pharmacy dropdown in user creation form
- Loads available pharmacies
- Shows pharmacy selector only when role is PHARMACY
- Sends `pharmacyId` in the request

## Backend Changes Needed

### 1. Verify CreateUserRequest DTO

Make sure your DTO has the `pharmacyId` field:

```java
package com.example.pharmacybackend.dto.admin.request;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String role;
    private Long pharmacyId;  // ⭐ Make sure this field exists
}
```

### 2. Update AdminService.createUser Method

Your current code already validates pharmacyId (line 136), which is good. Make sure it looks like this:

```java
@Transactional
public UserDTO createUser(CreateUserRequest request) {
    // Validate username uniqueness
    if (userRepository.findByUsername(request.getUsername()).isPresent()) {
        throw new IllegalArgumentException("Username already exists");
    }
    
    // Validate email if provided
    if (request.getEmail() != null && userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new IllegalArgumentException("Email already exists");
    }
    
    // ⭐ Validate pharmacy ID for PHARMACY role
    if ("PHARMACY".equalsIgnoreCase(request.getRole()) && request.getPharmacyId() == null) {
        throw new IllegalArgumentException("pharmacyId is required for PHARMACY role");
    }
    
    // Create user entity
    User user = new User();
    user.setUsername(request.getUsername());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    user.setRole(request.getRole());
    user.setStatus("ACTIVE"); // New users are active by default
    
    // ⭐ Assign pharmacy if role is PHARMACY
    if ("PHARMACY".equalsIgnoreCase(request.getRole())) {
        Pharmacy pharmacy = pharmacyRepository.findById(request.getPharmacyId())
            .orElseThrow(() -> new IllegalArgumentException("Pharmacy not found with ID: " + request.getPharmacyId()));
        user.setPharmacy(pharmacy);
    }
    
    // Save user
    user = userRepository.save(user);
    
    // Convert to DTO and return
    return mapToUserDTO(user);
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
    
    // Include pharmacy info if user has pharmacy
    if (user.getPharmacy() != null) {
        dto.setPharmacyId(user.getPharmacy().getId());
        dto.setPharmacyName(user.getPharmacy().getName());
    }
    
    return dto;
}
```

### 3. Update UserDTO (if needed)

Your UserDTO should include pharmacy information:

```java
package com.example.pharmacybackend.dto.admin;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private Long pharmacyId;      // ⭐ Add these fields
    private String pharmacyName;  // ⭐ Add these fields
}
```

### 4. Update User Entity (verify)

Make sure your User entity has the pharmacy relationship:

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    
    // ⭐ Pharmacy relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacy_id")
    private Pharmacy pharmacy;
    
    // Getters and setters...
}
```

### 5. Database Schema

Make sure your users table has the pharmacy_id column:

```sql
ALTER TABLE users ADD COLUMN pharmacy_id BIGINT;
ALTER TABLE users ADD CONSTRAINT fk_users_pharmacy 
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id);
```

Or in your migration/schema:

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    pharmacy_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id)
);
```

## Testing Steps

1. **Create a pharmacy first** (if you don't have any):
   - Go to Admin → Pharmacies
   - Add a new pharmacy
   
2. **Create a PHARMACY user**:
   - Go to Admin → Users
   - Click "Add User"
   - Fill in details
   - Select role: PHARMACY
   - Select a pharmacy from dropdown
   - Submit

3. **Verify**:
   - User should be created successfully
   - User should be linked to the selected pharmacy
   - Check database: `SELECT * FROM users WHERE role = 'PHARMACY';`
   - Verify pharmacy_id is set correctly

## Common Errors & Solutions

**Error: "pharmacyId is required for PHARMACY role"**
- Frontend is not sending pharmacyId
- Check network tab to verify payload includes pharmacyId
- Already fixed in frontend ✅

**Error: "Pharmacy not found with ID: X"**
- Pharmacy with that ID doesn't exist in database
- Verify pharmacy exists: `SELECT * FROM pharmacies WHERE id = X;`

**Error: "Column 'pharmacy_id' not found"**
- Database schema missing pharmacy_id column
- Run the ALTER TABLE statement above

**Error: "Could not initialize proxy - no Session"**
- Lazy loading issue with Pharmacy relationship
- Add @Transactional to createUser method
- Or use EAGER fetch for pharmacy relationship

## Request/Response Examples

**Request (from frontend):**
```json
{
  "username": "pharmacy_user1",
  "password": "password123",
  "name": "John Pharmacy",
  "email": "john@pharmacy.com",
  "phone": "+94771234567",
  "role": "PHARMACY",
  "pharmacyId": 1
}
```

**Response:**
```json
{
  "id": 5,
  "username": "pharmacy_user1",
  "name": "John Pharmacy",
  "email": "john@pharmacy.com",
  "phone": "+94771234567",
  "role": "PHARMACY",
  "status": "ACTIVE",
  "pharmacyId": 1,
  "pharmacyName": "City Pharmacy"
}
```

## Summary

✅ **Frontend** - Updated to show pharmacy dropdown and send pharmacyId
⚠️ **Backend** - Verify the above changes are in place

The key requirement: When role is PHARMACY, the pharmacyId must be provided and the User entity must be linked to that Pharmacy.
