# Spring Boot Backend API Requirements for Admin Dashboard

## Overview
The admin dashboard frontend requires the following REST API endpoints to manage pharmacies, users, and view system analytics. **Note:** Admin does NOT see individual pharmacy orders (those are private to each pharmacy).

---

## 1. ADMIN STATS & ANALYTICS

### GET /admin/stats
**Description:** Get comprehensive system statistics and analytics data  
**Auth:** Admin role required  
**Response:**
```json
{
  "totalUsers": 250,
  "activeUsers": 230,
  "totalPharmacies": 12,
  "totalMedicines": 150,
  "usersByRole": [
    { "role": "CUSTOMER", "count": 200 },
    { "role": "PHARMACY", "count": 45 },
    { "role": "ADMIN", "count": 5 }
  ],
  "pharmaciesByRegion": [
    { "region": "Colombo", "count": 5 },
    { "region": "Kandy", "count": 3 },
    { "region": "Galle", "count": 4 }
  ],
  "topMedicines": [
    { "name": "Paracetamol", "totalStock": 1500, "pharmacyCount": 10 },
    { "name": "Amoxicillin", "totalStock": 800, "pharmacyCount": 8 },
    { "name": "Ibuprofen", "totalStock": 600, "pharmacyCount": 7 }
  ]
}
```

**Field Descriptions:**
- `totalUsers`: Total count of all users in system
- `activeUsers`: Count of users with status = "ACTIVE"
- `totalPharmacies`: Total pharmacies registered
- `totalMedicines`: Total unique medicines available across all pharmacies
- `usersByRole`: Array showing user distribution by role (CUSTOMER, PHARMACY, ADMIN)
- `pharmaciesByRegion`: Array showing pharmacy distribution by region/city (extract from address or use separate region field)
- `topMedicines`: Top medicines by total stock across all pharmacies, showing:
  - `name`: Medicine name
  - `totalStock`: Sum of stock quantities across all pharmacies
  - `pharmacyCount`: Number of pharmacies carrying this medicine

---

## 2. PHARMACY MANAGEMENT

### GET /admin/pharmacies
**Description:** Get all pharmacies  
**Auth:** Admin role required  
**Response:**
```json
[
  {
    "id": 1,
    "name": "City Pharmacy",
    "address": "123 Main St, Colombo",
    "phone": "+94771234567",
    "latitude": 6.9271,
    "longitude": 79.8612
  }
]
```

### POST /admin/pharmacies
**Description:** Create a new pharmacy  
**Auth:** Admin role required  
**Request Body:**
```json
{
  "name": "New Pharmacy",
  "address": "456 Park Ave, Colombo",
  "phone": "+94777654321",
  "latitude": 6.9500,
  "longitude": 79.8700
}
```
**Response:**
```json
{
  "id": 13,
  "name": "New Pharmacy",
  "address": "456 Park Ave, Colombo",
  "phone": "+94777654321",
  "latitude": 6.9500,
  "longitude": 79.8700
}
```

### PUT /admin/pharmacies/{pharmacyId}
**Description:** Update pharmacy details (optional - for future enhancement)  
**Auth:** Admin role required  
**Path Param:** pharmacyId (Long)  
**Request Body:** Same as POST

### DELETE /admin/pharmacies/{pharmacyId}
**Description:** Delete a pharmacy  
**Auth:** Admin role required  
**Path Param:** pharmacyId (Long)  
**Response:** 200 OK or 204 No Content

---

## 3. USER MANAGEMENT

### GET /admin/users
**Description:** Get all users  
**Auth:** Admin role required  
**Query Params (optional):**
- `role` (string): Filter by role - "CUSTOMER" | "PHARMACY" | "ADMIN"

**Response:**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  },
  {
    "id": 2,
    "username": "city_pharmacy",
    "name": "City Pharmacy Admin",
    "email": "admin@citypharmacy.com",
    "phone": "+94777654321",
    "role": "PHARMACY",
    "status": "ACTIVE",
    "pharmacyId": 1
  }
]
```

### POST /admin/users
**Description:** Create a new user (admin can add pharmacy users)  
**Auth:** Admin role required  
**Request Body:**
```json
{
  "username": "newuser",
  "password": "securePassword123",
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "+94771111111",
  "role": "CUSTOMER"
}
```
**For pharmacy users, include:**
```json
{
  "username": "pharmacy_user",
  "password": "securePass123",
  "name": "Pharmacy Manager",
  "email": "manager@pharmacy.com",
  "phone": "+94772222222",
  "role": "PHARMACY",
  "pharmacyId": 5
}
```
**Response:** Created user object

### PUT /admin/users/{userId}/status
**Description:** Activate or deactivate a user  
**Auth:** Admin role required  
**Path Param:** userId (Long)  
**Request Body:**
```json
{
  "status": "ACTIVE"
}
```
or
```json
{
  "status": "INACTIVE"
}
```
**Response:** Updated user object

### PUT /admin/users/{userId}/password
**Description:** Change user password (admin reset)  
**Auth:** Admin role required  
**Path Param:** userId (Long)  
**Request Body:**
```json
{
  "newPassword": "newSecurePassword123"
}
```
**Response:** Success message or updated user object

### DELETE /admin/users/{userId}
**Description:** Delete a user (optional - use deactivate instead)  
**Auth:** Admin role required  
**Path Param:** userId (Long)  
**Response:** 200 OK or 204 No Content

---

## Implementation Notes

### Security
- All endpoints MUST require authentication with `ADMIN` role
- Use Spring Security `@PreAuthorize("hasRole('ADMIN')")` or similar
- Validate input to prevent SQL injection, XSS, etc.

### Database Schema Updates Needed

**Users table:**
- Add `status` column (VARCHAR or ENUM): "ACTIVE", "INACTIVE" (default: ACTIVE)
- Consider soft delete flag instead of actual deletion

**Pharmacies table (if not exists):**
```sql
CREATE TABLE pharmacies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  phone VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Users table update:**
```sql
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN pharmacy_id BIGINT NULL;
ALTER TABLE users ADD FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id);
```

### DTOs to Create

1. **AdminStatsDTO** - Main stats response containing:
   - Basic counts (totalUsers, activeUsers, totalPharmacies, totalMedicines)
   - `List<UsersByRoleDTO> usersByRole`
   - `List<PharmaciesByRegionDTO> pharmaciesByRegion`
   - `List<TopMedicineDTO> topMedicines`

2. **UsersByRoleDTO**
   - `String role` - "CUSTOMER", "PHARMACY", "ADMIN"
   - `Integer count`

3. **PharmaciesByRegionDTO**
   - `String region` - City/region name (extract from address field)
   - `Integer count`

4. **TopMedicineDTO**
   - `String name` - Medicine name
   - `Integer totalStock` - Sum of quantities across all pharmacies
   - `Integer pharmacyCount` - Number of pharmacies carrying this medicine

5. **PharmacyDTO** - for pharmacy CRUD
6. **UserDTO** - for user management (include status field)
7. **CreateUserRequest** - for POST /admin/users
8. **UpdateUserStatusRequest** - for status updates
9. **ChangePasswordRequest** - for password changes

### Service Layer

Create `AdminService.java` with methods:

**Analytics:**
- `getSystemStats()` - Returns AdminStatsDTO with all charts data

**Pharmacy Management:**
- `getAllPharmacies()`
- `createPharmacy(PharmacyDTO dto)`
- `deletePharmacy(Long id)`

**User Management:**
- `getAllUsers(String roleFilter)`
- `createUser(CreateUserRequest request)`
- `updateUserStatus(Long userId, String status)`
- `changeUserPassword(Long userId, String newPassword)`

### Controller

Create `AdminController.java` with `@RestController` and `@RequestMapping("/admin")`

---

## Example Spring Boot Controller Stub

```java
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/pharmacies")
    public ResponseEntity<List<PharmacyDTO>> getAllPharmacies() {
        return ResponseEntity.ok(adminService.getAllPharmacies());
    }

    @PostMapping("/pharmacies")
    public ResponseEntity<PharmacyDTO> createPharmacy(@RequestBody PharmacyDTO dto) {
        return ResponseEntity.ok(adminService.createPharmacy(dto));
    }

    @DeleteMapping("/pharmacies/{id}")
    public ResponseEntity<Void> deletePharmacy(@PathVariable Long id) {
        adminService.deletePharmacy(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestParam(required = false) String role) {
        return ResponseEntity.ok(adminService.getAllUsers(role));
    }

    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserDTO> updateUserStatus(
        @PathVariable Long userId,
        @RequestBody UpdateUserStatusRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, request.getStatus()));
    }

    @PutMapping("/users/{userId}/password")
    public ResponseEntity<Void> changePassword(
        @PathVariable Long userId,
        @RequestBody ChangePasswordRequest request
    ) {
        adminService.changeUserPassword(userId, request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
```

---

## Example AdminService Implementation for Stats

```java
@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PharmacyRepository pharmacyRepository;
    
    @Autowired
    private MedicineRepository medicineRepository;
    
    @Autowired
    private StockRepository stockRepository;

    public AdminStatsDTO getSystemStats() {
        AdminStatsDTO stats = new AdminStatsDTO();
        
        // Basic counts
        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.countByStatus("ACTIVE"));
        stats.setTotalPharmacies(pharmacyRepository.count());
        stats.setTotalMedicines(medicineRepository.count());
        
        // Users by role
        List<UsersByRoleDTO> usersByRole = new ArrayList<>();
        usersByRole.add(new UsersByRoleDTO("CUSTOMER", userRepository.countByRole("CUSTOMER")));
        usersByRole.add(new UsersByRoleDTO("PHARMACY", userRepository.countByRole("PHARMACY")));
        usersByRole.add(new UsersByRoleDTO("ADMIN", userRepository.countByRole("ADMIN")));
        stats.setUsersByRole(usersByRole);
        
        // Pharmacies by region (extract from address or use city field)
        List<PharmaciesByRegionDTO> pharmaciesByRegion = pharmacyRepository.countByRegion();
        stats.setPharmaciesByRegion(pharmaciesByRegion);
        
        // Top medicines by total stock
        List<TopMedicineDTO> topMedicines = stockRepository.findTopMedicinesByStock(10);
        stats.setTopMedicines(topMedicines);
        
        return stats;
    }
}
```

---

## Custom Repository Queries Needed

### UserRepository
```java
@Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
Long countByStatus(@Param("status") String status);

@Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
Integer countByRole(@Param("role") String role);
```

### PharmacyRepository
```java
// Option 1: If you have a 'city' or 'region' column
@Query("SELECT new com.yourpackage.dto.PharmaciesByRegionDTO(p.city, COUNT(p)) " +
       "FROM Pharmacy p GROUP BY p.city ORDER BY COUNT(p) DESC")
List<PharmaciesByRegionDTO> countByRegion();

// Option 2: Extract from address field (more complex)
@Query("SELECT new com.yourpackage.dto.PharmaciesByRegionDTO(" +
       "SUBSTRING(p.address, LOCATE(',', p.address) + 1), COUNT(p)) " +
       "FROM Pharmacy p GROUP BY SUBSTRING(p.address, LOCATE(',', p.address) + 1)")
List<PharmaciesByRegionDTO> countByRegion();
```

### StockRepository (or custom query)
```java
@Query("SELECT new com.yourpackage.dto.TopMedicineDTO(" +
       "m.name, SUM(s.quantity), COUNT(DISTINCT s.pharmacy)) " +
       "FROM Stock s JOIN s.medicine m " +
       "GROUP BY m.id, m.name " +
       "ORDER BY SUM(s.quantity) DESC")
List<TopMedicineDTO> findTopMedicinesByStock(@Param("limit") int limit);
```

---

## Testing the Frontend

Once these endpoints are implemented:
1. Login as admin user
2. Navigate to `/admin/dashboard` to see overview
3. Navigate to `/admin/reports` to see:
   - Active users by role chart
   - Pharmacies by region chart
   - Top medicines by stock chart
   - Click any chart to see detail modal
4. Navigate to `/admin/pharmacies` to add/delete pharmacies
5. Navigate to `/admin/users` to manage users, change passwords, activate/deactivate

**Note:** Admin does NOT see pharmacy orders or revenue - those are private to each individual pharmacy.

The frontend is fully implemented and ready to connect to these endpoints!
