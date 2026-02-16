# Backend API Update: Add Pharmacy Phone to Customer Orders

## Required Change

The **GET /customers/{customerId}/orders** endpoint needs to include the pharmacy phone number in the response.

---

## Current Endpoint

**Endpoint:** `GET /customers/{customerId}/orders`

**Description:** Get all orders for a specific customer

**Authentication:** Required (JWT token)

---

## Current Response Format

```json
[
  {
    "id": 123,
    "customerId": 5,
    "customerName": "John Doe",
    "pharmacyId": 10,
    "pharmacyName": "City Pharmacy",
    "status": "PENDING",
    "totalAmount": 150.00,
    "statusMessage": null,
    "createdAt": "2026-02-16T10:30:00",
    "items": [
      {
        "medicineId": 45,
        "medicineName": "Paracetamol",
        "quantity": 2,
        "price": 25.00,
        "unitPrice": 25.00
      }
    ]
  }
]
```

---

## ✅ Updated Response Format (Add `pharmacyPhone`)

```json
[
  {
    "id": 123,
    "customerId": 5,
    "customerName": "John Doe",
    "pharmacyId": 10,
    "pharmacyName": "City Pharmacy",
    "pharmacyPhone": "+94771234567",  // ⭐ NEW FIELD
    "status": "PENDING",
    "totalAmount": 150.00,
    "statusMessage": null,
    "createdAt": "2026-02-16T10:30:00",
    "items": [
      {
        "medicineId": 45,
        "medicineName": "Paracetamol",
        "quantity": 2,
        "price": 25.00,
        "unitPrice": 25.00
      }
    ]
  }
]
```

---

## Spring Boot Implementation

### Option 1: Update OrderDTO

Add `pharmacyPhone` to your `OrderDTO` or `OrderResponseDTO`:

```java
package com.example.pharmacybackend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long pharmacyId;
    private String pharmacyName;
    private String pharmacyPhone;  // ⭐ Add this field
    private String status;
    private Double totalAmount;
    private String statusMessage;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items;
}
```

### Option 2: Update Controller/Service

Modify your controller or service to include pharmacy phone:

```java
@RestController
@RequestMapping("/customers")
public class CustomerOrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private PharmacyService pharmacyService;
    
    @GetMapping("/{customerId}/orders")
    public ResponseEntity<List<OrderResponseDTO>> getCustomerOrders(
            @PathVariable Long customerId,
            Authentication authentication) {
        
        // Get customer orders
        List<OrderResponseDTO> orders = orderService.getOrdersByCustomerId(customerId);
        
        // Enrich with pharmacy phone number
        for (OrderResponseDTO order : orders) {
            if (order.getPharmacyId() != null) {
                Pharmacy pharmacy = pharmacyService.findById(order.getPharmacyId())
                    .orElse(null);
                if (pharmacy != null) {
                    order.setPharmacyPhone(pharmacy.getPhone());  // ⭐ Add phone
                }
            }
        }
        
        return ResponseEntity.ok(orders);
    }
}
```

### Option 3: Update SQL Query (Most Efficient)

If you're using a query method, include pharmacy phone in the JOIN:

```java
@Query("""
    SELECT new com.example.pharmacybackend.dto.OrderResponseDTO(
        o.id,
        c.id,
        c.name,
        p.id,
        p.name,
        p.phone,
        o.status,
        o.totalAmount,
        o.statusMessage,
        o.createdAt
    )
    FROM Order o
    JOIN o.customer c
    JOIN o.pharmacy p
    WHERE c.id = :customerId
    ORDER BY o.createdAt DESC
    """)
List<OrderResponseDTO> findOrdersByCustomerId(@Param("customerId") Long customerId);
```

**Update DTO Constructor:**

```java
public class OrderResponseDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long pharmacyId;
    private String pharmacyName;
    private String pharmacyPhone;  // ⭐ Added
    private String status;
    private Double totalAmount;
    private String statusMessage;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items;
    
    // Constructor for query projection
    public OrderResponseDTO(Long id, Long customerId, String customerName,
                           Long pharmacyId, String pharmacyName, String pharmacyPhone,
                           String status, Double totalAmount, String statusMessage,
                           LocalDateTime createdAt) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.pharmacyId = pharmacyId;
        this.pharmacyName = pharmacyName;
        this.pharmacyPhone = pharmacyPhone;  // ⭐ Added
        this.status = status;
        this.totalAmount = totalAmount;
        this.statusMessage = statusMessage;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters (or use @Data from Lombok)
}
```

### Option 4: Using MapStruct (If you use it)

```java
@Mapper(componentModel = "spring")
public interface OrderMapper {
    
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.name", target = "customerName")
    @Mapping(source = "pharmacy.id", target = "pharmacyId")
    @Mapping(source = "pharmacy.name", target = "pharmacyName")
    @Mapping(source = "pharmacy.phone", target = "pharmacyPhone")  // ⭐ Add this
    OrderResponseDTO toDTO(Order order);
    
    List<OrderResponseDTO> toDTOList(List<Order> orders);
}
```

---

## Example Order Entity Relationship

Make sure your Order entity has proper relationships:

```java
@Entity
@Table(name = "orders")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacy_id")
    private Pharmacy pharmacy;  // ⭐ Make sure this relationship exists
    
    private String status;
    private Double totalAmount;
    private String statusMessage;
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
    
    // Getters and Setters
}
```

---

## Testing

### Test 1: Get customer orders
```bash
curl -X GET http://localhost:8080/customers/5/orders \
  -H "Authorization: Bearer <jwt_token>"
```

**Expected Response:**
```json
[
  {
    "id": 123,
    "customerId": 5,
    "customerName": "John Doe",
    "pharmacyId": 10,
    "pharmacyName": "City Pharmacy",
    "pharmacyPhone": "+94771234567",
    "status": "PENDING",
    "totalAmount": 150.00,
    "statusMessage": null,
    "createdAt": "2026-02-16T10:30:00",
    "items": [
      {
        "medicineId": 45,
        "medicineName": "Paracetamol",
        "quantity": 2,
        "price": 25.00
      }
    ]
  }
]
```

### Test 2: Verify pharmacy phone is included
```bash
# After placing an order, check the order details
curl -X GET http://localhost:8080/customers/5/orders \
  -H "Authorization: Bearer <jwt_token>" | jq '.[0].pharmacyPhone'
```

**Expected Output:**
```
"+94771234567"
```

---

## Database Verification

Make sure your `pharmacies` table has phone numbers:

```sql
-- Check existing pharmacy data
SELECT id, name, phone FROM pharmacies;

-- If phone numbers are missing, add them
UPDATE pharmacies SET phone = '+94771234567' WHERE id = 1;
UPDATE pharmacies SET phone = '+94772345678' WHERE id = 2;
UPDATE pharmacies SET phone = '+94773456789' WHERE id = 3;
```

---

## Security Considerations

✅ **Good Practice:**
- Include pharmacy phone for customer convenience (they need to contact pharmacy)
- No sensitive data exposure (phone numbers are meant to be public for business contact)

❌ **Don't Include:**
- Pharmacy owner's personal phone (use business phone only)
- Internal pharmacy system credentials
- Pharmacy financial information

---

## Alternative: Get Phone from Pharmacy Details Endpoint

If you prefer not to include phone in every order response, you can:

1. **Option A:** Keep orders simple, let frontend fetch pharmacy details separately
2. **Option B:** Add a `GET /pharmacies/{id}` endpoint that returns full pharmacy info including phone
3. **Option C (Recommended):** Include phone in orders response for better UX and fewer API calls

---

## Summary

**What to Add:**
- ✅ Add `pharmacyPhone` field to customer orders response
- ✅ Include phone number from the `pharmacies` table via JOIN or relationship
- ✅ Return phone in the format stored in database (e.g., "+94771234567")
- ✅ Test with existing orders to ensure phone appears

**Frontend Changes:**
- ✅ Already updated! The UI now displays pharmacy phone with a clickable link
- ✅ Phone icon shown for easy recognition
- ✅ Appears in CustomerOrders page "My Orders" section

Once you update the backend, customers will see pharmacy contact numbers in their order history! 📞
