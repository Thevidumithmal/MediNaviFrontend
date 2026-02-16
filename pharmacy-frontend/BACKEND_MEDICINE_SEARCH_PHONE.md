# Backend API Update: Add Pharmacy Phone to Medicine Search Results

## Required Change

The **GET /medicines/search** endpoint needs to include the pharmacy phone number in the response.

---

## Current Endpoint

**Endpoint:** `GET /medicines/search`

**Parameters:**
- `name` (required): Medicine name to search
- `lat` (optional): User's latitude for distance calculation
- `lon` or `lng` (optional): User's longitude for distance calculation

---

## Current Response Format

```json
[
  {
    "stockId": 123,
    "medicineId": 45,
    "medicineName": "Paracetamol",
    "pharmacyId": 10,
    "pharmacyName": "City Pharmacy",
    "address": "123 Main St, Colombo",
    "quantity": 50,
    "price": 25.00,
    "distanceKm": 2.5
  }
]
```

---

## ✅ Updated Response Format (Add `pharmacyPhone`)

```json
[
  {
    "stockId": 123,
    "medicineId": 45,
    "medicineName": "Paracetamol",
    "pharmacyId": 10,
    "pharmacyName": "City Pharmacy",
    "address": "123 Main St, Colombo",
    "pharmacyPhone": "+94771234567",  // ⭐ NEW FIELD
    "quantity": 50,
    "price": 25.00,
    "distanceKm": 2.5
  }
]
```

---

## Spring Boot Implementation

### Option 1: Update DTO (Recommended)

Add `pharmacyPhone` to your `MedicineSearchResultDTO`:

```java
package com.example.pharmacybackend.dto;

import lombok.Data;

@Data
public class MedicineSearchResultDTO {
    private Long stockId;
    private Long medicineId;
    private String medicineName;
    private Long pharmacyId;
    private String pharmacyName;
    private String address;
    private String pharmacyPhone;  // ⭐ Add this field
    private Integer quantity;
    private Double price;
    private Double distanceKm;
}
```

### Option 2: Update Controller/Service

Modify your controller or service to include pharmacy phone in the response:

```java
@RestController
@RequestMapping("/medicines")
public class MedicineController {
    
    @Autowired
    private MedicineService medicineService;
    
    @Autowired
    private PharmacyService pharmacyService;
    
    @GetMapping("/search")
    public ResponseEntity<List<MedicineSearchResultDTO>> searchMedicines(
            @RequestParam String name,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double lng) {
        
        // Use lng if lon is null (for compatibility)
        Double longitude = (lon != null) ? lon : lng;
        
        // Get medicine search results
        List<MedicineSearchResultDTO> results = medicineService.searchByName(name, lat, longitude);
        
        // Enrich with pharmacy phone number
        for (MedicineSearchResultDTO result : results) {
            if (result.getPharmacyId() != null) {
                Pharmacy pharmacy = pharmacyService.findById(result.getPharmacyId())
                    .orElse(null);
                if (pharmacy != null) {
                    result.setPharmacyPhone(pharmacy.getPhone());  // ⭐ Add phone
                }
            }
        }
        
        return ResponseEntity.ok(results);
    }
}
```

### Option 3: Update SQL Query (Most Efficient)

If you're using a SQL query to get results, include pharmacy phone in the JOIN:

```java
@Query("""
    SELECT new com.example.pharmacybackend.dto.MedicineSearchResultDTO(
        s.id,
        m.id,
        m.name,
        p.id,
        p.name,
        p.address,
        p.phone,
        s.quantity,
        s.price,
        CASE 
            WHEN :lat IS NOT NULL AND :lon IS NOT NULL 
            THEN (6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * 
                 cos(radians(p.longitude) - radians(:lon)) + 
                 sin(radians(:lat)) * sin(radians(p.latitude))))
            ELSE NULL 
        END
    )
    FROM Stock s
    JOIN s.medicine m
    JOIN s.pharmacy p
    WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%'))
    AND s.quantity > 0
    ORDER BY 
        CASE 
            WHEN :lat IS NOT NULL AND :lon IS NOT NULL 
            THEN (6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * 
                 cos(radians(p.longitude) - radians(:lon)) + 
                 sin(radians(:lat)) * sin(radians(p.latitude))))
            ELSE p.id 
        END
    """)
List<MedicineSearchResultDTO> searchMedicines(
    @Param("name") String name,
    @Param("lat") Double lat,
    @Param("lon") Double lon
);
```

**Update DTO Constructor:**

```java
public class MedicineSearchResultDTO {
    private Long stockId;
    private Long medicineId;
    private String medicineName;
    private Long pharmacyId;
    private String pharmacyName;
    private String address;
    private String pharmacyPhone;  // ⭐ Added
    private Integer quantity;
    private Double price;
    private Double distanceKm;
    
    // Update constructor to accept phone parameter
    public MedicineSearchResultDTO(Long stockId, Long medicineId, String medicineName,
                                   Long pharmacyId, String pharmacyName, String address,
                                   String pharmacyPhone,  // ⭐ Added
                                   Integer quantity, Double price, Double distanceKm) {
        this.stockId = stockId;
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.pharmacyId = pharmacyId;
        this.pharmacyName = pharmacyName;
        this.address = address;
        this.pharmacyPhone = pharmacyPhone;  // ⭐ Added
        this.quantity = quantity;
        this.price = price;
        this.distanceKm = distanceKm;
    }
    
    // Getters and Setters (or use @Data from Lombok)
}
```

---

## What to Check in Your Database

Make sure your `pharmacies` table has a `phone` column:

```sql
SELECT id, name, address, phone FROM pharmacies LIMIT 5;
```

If the column doesn't exist, add it:

```sql
ALTER TABLE pharmacies ADD COLUMN phone VARCHAR(20);
```

Then update pharmacy phone numbers:

```sql
UPDATE pharmacies SET phone = '+94771234567' WHERE id = 1;
UPDATE pharmacies SET phone = '+94772345678' WHERE id = 2;
-- etc.
```

---

## Testing

### Test 1: Search without location
```bash
curl "http://localhost:8080/medicines/search?name=paracetamol"
```

**Expected Response:**
```json
[
  {
    "stockId": 123,
    "medicineId": 45,
    "medicineName": "Paracetamol",
    "pharmacyId": 10,
    "pharmacyName": "City Pharmacy",
    "address": "123 Main St, Colombo",
    "pharmacyPhone": "+94771234567",
    "quantity": 50,
    "price": 25.00,
    "distanceKm": null
  }
]
```

### Test 2: Search with location
```bash
curl "http://localhost:8080/medicines/search?name=paracetamol&lat=6.9271&lon=79.8612"
```

**Expected Response:**
```json
[
  {
    "stockId": 123,
    "medicineId": 45,
    "medicineName": "Paracetamol",
    "pharmacyId": 10,
    "pharmacyName": "City Pharmacy",
    "address": "123 Main St, Colombo",
    "pharmacyPhone": "+94771234567",
    "quantity": 50,
    "price": 25.00,
    "distanceKm": 2.5
  }
]
```

---

## Summary

**What to Add:**
- ✅ Add `pharmacyPhone` field to the medicine search response
- ✅ Include phone number from the `pharmacies` table
- ✅ Return phone in the same format as stored in database (e.g., "+94771234567")

**Frontend Changes:**
- ✅ Already updated! The frontend now displays pharmacy phone number with a clickable tel: link
- ✅ Phone icon shown for better UX
- ✅ Works in both CustomerSearch and CustomerOCR pages

Once you update the backend, the phone number will automatically appear in the search results! 📞
