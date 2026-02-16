# Backend Fix: "Pharmacy not found for current user" Error

## Problem
When a pharmacy user logs in and tries to mark an order as "READY", they get the error: **"Pharmacy not found for current user"**

## Root Cause
The user-pharmacy relationship is not properly established when admin creates pharmacy users. The backend needs to set BOTH bidirectional relationships:
1. `user.pharmacy = pharmacy` (user belongs to a pharmacy)
2. `pharmacy.owner = user` (pharmacy is owned by this user)

---

## Fix 1: Update AdminService.createUser()

**Location:** `com.yourpackage.service.AdminService` (or wherever you handle user creation)

**Complete Method:**

```java
@Transactional
public User createUser(UserCreateRequest request) {
    // Validate username and email uniqueness
    if (userRepository.existsByUsername(request.getUsername())) {
        throw new RuntimeException("Username already exists");
    }
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Email already exists");
    }
    
    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setFullName(request.getFullName());
    user.setPhone(request.getPhone());
    user.setRole(request.getRole());
    user.setStatus("ACTIVE");
    
    // CRITICAL: Handle pharmacy relationship for PHARMACY role users
    if ("PHARMACY".equals(request.getRole())) {
        if (request.getPharmacyId() == null) {
            throw new RuntimeException("pharmacyId is required for PHARMACY role users");
        }
        
        Pharmacy pharmacy = pharmacyRepository.findById(request.getPharmacyId())
            .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        
        // Set BOTH relationships - this is critical!
        user.setPharmacy(pharmacy);  // user belongs to pharmacy
        
        // Save user first
        user = userRepository.save(user);
        
        // Then set reverse relationship
        pharmacy.setOwner(user);  // pharmacy owned by user
        pharmacyRepository.save(pharmacy);
        
        return user;
    }
    
    return userRepository.save(user);
}
```

**What Changed:**
- Added check for `PHARMACY` role
- Validates `pharmacyId` is provided
- Sets `user.pharmacy` relationship
- Saves user first
- Sets `pharmacy.owner` reverse relationship
- Saves pharmacy

**Required in UserCreateRequest DTO:**
```java
public class UserCreateRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String role;
    private Long pharmacyId;  // ADD THIS FIELD
    
    // getters and setters...
}
```

---

## Fix 2: Update Order Status Endpoint

**Location:** `com.yourpackage.controller.OrderController` (or wherever you handle order status updates)

**Complete Method:**

```java
@PatchMapping("/orders/{orderId}/status")
public ResponseEntity<?> updateOrderStatus(
    @PathVariable Long orderId,
    @RequestBody OrderStatusUpdateRequest request,
    @AuthenticationPrincipal User currentUser
) {
    // Get pharmacy from current user with fallback
    Pharmacy pharmacy = currentUser.getPharmacy();
    
    if (pharmacy == null) {
        // Fallback: Try finding pharmacy by owner
        pharmacy = pharmacyRepository.findByOwner(currentUser)
            .orElseThrow(() -> new RuntimeException("Pharmacy not found for current user"));
    }
    
    // Find the order
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("Order not found"));
    
    // Security check: Verify the order belongs to this pharmacy
    if (!order.getPharmacy().getId().equals(pharmacy.getId())) {
        throw new RuntimeException("Unauthorized: Order does not belong to your pharmacy");
    }
    
    // Update order status
    order.setStatus(request.getStatus());
    if (request.getMessage() != null) {
        order.setMessage(request.getMessage());
    }
    orderRepository.save(order);
    
    return ResponseEntity.ok(order);
}
```

**What Changed:**
- Added fallback to find pharmacy by owner if `user.pharmacy` is null
- Added security check to ensure order belongs to pharmacy
- Better error messages

**Required Repository Method:**

Add this to your `PharmacyRepository`:

```java
public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {
    Optional<Pharmacy> findByOwner(User owner);
    // ... other methods
}
```

---

## Fix 3: Handle Existing Pharmacy Users

If you already have pharmacy users created without the proper relationship, you have 2 options:

### Option A: Recreate Users (Recommended)
1. Log in as admin
2. Delete the existing pharmacy users
3. Create new pharmacy users (the fix above will set relationships correctly)

### Option B: Manual Database Fix

Run this SQL to fix existing relationships:

```sql
-- For each pharmacy user, set their pharmacy relationship
-- Replace {user_id} and {pharmacy_id} with actual values

UPDATE users 
SET pharmacy_id = {pharmacy_id} 
WHERE id = {user_id} AND role = 'PHARMACY';

UPDATE pharmacies 
SET owner_id = {user_id} 
WHERE id = {pharmacy_id};
```

**Example:**
```sql
-- If user ID 5 should own pharmacy ID 2
UPDATE users SET pharmacy_id = 2 WHERE id = 5;
UPDATE pharmacies SET owner_id = 5 WHERE id = 2;
```

---

## Testing After Fix

1. **Create a new pharmacy user:**
   - Login as admin
   - Go to Users page
   - Click "Add User"
   - Select role: PHARMACY
   - Select a pharmacy from dropdown
   - Fill other fields and submit
   - User should be created with `pharmacyId` set

2. **Test order status update:**
   - Login as the pharmacy user
   - Go to Orders page
   - Find an order with status "PENDING"
   - Click "Mark Ready"
   - Should succeed without "Pharmacy not found" error

3. **Verify in database:**
   ```sql
   -- Check user has pharmacy_id set
   SELECT id, username, role, pharmacy_id FROM users WHERE role = 'PHARMACY';
   
   -- Check pharmacy has owner_id set
   SELECT id, name, owner_id FROM pharmacies;
   ```

---

## Entity Relationships Required

Make sure your entities have these relationships:

**User.java:**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ... other fields
    
    @ManyToOne
    @JoinColumn(name = "pharmacy_id")
    private Pharmacy pharmacy;  // REQUIRED
    
    // getters and setters...
}
```

**Pharmacy.java:**
```java
@Entity
@Table(name = "pharmacies")
public class Pharmacy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ... other fields
    
    @OneToOne
    @JoinColumn(name = "owner_id")
    private User owner;  // REQUIRED
    
    // getters and setters...
}
```

---

## Summary

**Changes Required:**
1. ✅ Add `pharmacyId` field to `UserCreateRequest` DTO
2. ✅ Update `AdminService.createUser()` to set both relationships for PHARMACY users
3. ✅ Add `findByOwner()` method to `PharmacyRepository`
4. ✅ Update order status endpoint to handle missing pharmacy with fallback
5. ✅ Fix existing pharmacy users (recreate or manual SQL)

**After these fixes:**
- Pharmacy users created by admin will have proper relationships
- Pharmacy users can successfully mark orders as READY/REJECTED
- No more "Pharmacy not found for current user" errors
