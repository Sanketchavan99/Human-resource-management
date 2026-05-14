# HR Management API Documentation

## Base URL
`http://localhost:5000/api`

---

## Authentication
All endpoints (except auth endpoints) require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. User APIs

**Note:** User creation is handled through authentication/bulk upload only.

### Get All Users
- **GET** `/api/users`
- **Auth Required:** Yes
- **Response:** Array of users (excludes password, otp, otpExpiry)

### Get User by ID
- **GET** `/api/users/:id`
- **Auth Required:** Yes
- **Response:** Single user object

### Update User
- **PUT** `/api/users/:id`
- **Auth Required:** Yes
- **Body:**
```json
{
  "name": "string",
  "empCode": "string",
  "phoneNumber": "string",
  "designation": "string",
  "dateOfJoining": "date",
  "salary": "number",
  // ... other user fields
}
```
- **Note:** Cannot update password, otp, otpExpiry, or role through this endpoint

### Delete User
- **DELETE** `/api/users/:id`
- **Auth Required:** Yes
- **Note:** Cannot delete admin users

### Bulk Upload Users
- **POST** `/api/users/bulk-upload`
- **Auth Required:** Yes
- **Content-Type:** multipart/form-data
- **Form Data:**
  - `file`: Excel file (.xlsx or .xls)

---

## 2. Company APIs

### Create Company
- **POST** `/api/companies`
- **Auth Required:** Yes
- **Body:**
```json
{
  "code": "string (required, unique)",
  "name": "string"
}
```

### Get All Companies
- **GET** `/api/companies`
- **Auth Required:** Yes

### Get Company by ID
- **GET** `/api/companies/:id`
- **Auth Required:** Yes

### Update Company
- **PUT** `/api/companies/:id`
- **Auth Required:** Yes
- **Body:**
```json
{
  "code": "string",
  "name": "string"
}
```

### Delete Company
- **DELETE** `/api/companies/:id`
- **Auth Required:** Yes

---

## 3. Center APIs

### Create Center
- **POST** `/api/centers`
- **Auth Required:** Yes
- **Body:**
```json
{
  "name": "string (required)",
  "city": "string",
  "state": "string",
  "zone": "string"
}
```

### Get All Centers
- **GET** `/api/centers`
- **Auth Required:** Yes

### Get Center by ID
- **GET** `/api/centers/:id`
- **Auth Required:** Yes

### Update Center
- **PUT** `/api/centers/:id`
- **Auth Required:** Yes
- **Body:**
```json
{
  "name": "string",
  "city": "string",
  "state": "string",
  "zone": "string"
}
```

### Delete Center
- **DELETE** `/api/centers/:id`
- **Auth Required:** Yes

---

## 4. Address APIs

### Create Address
- **POST** `/api/addresses`
- **Auth Required:** Yes
- **Body:**
```json
{
  "userId": "uuid (required)",
  "type": "Temporary | Permanent (required)",
  "addressLine": "string",
  "city": "string",
  "state": "string"
}
```

### Get All Addresses
- **GET** `/api/addresses`
- **Auth Required:** Yes

### Get Addresses by User ID
- **GET** `/api/addresses/user/:userId`
- **Auth Required:** Yes

### Get Address by ID
- **GET** `/api/addresses/:id`
- **Auth Required:** Yes

### Update Address
- **PUT** `/api/addresses/:id`
- **Auth Required:** Yes
- **Body:**
```json
{
  "type": "Temporary | Permanent",
  "addressLine": "string",
  "city": "string",
  "state": "string"
}
```

### Delete Address
- **DELETE** `/api/addresses/:id`
- **Auth Required:** Yes

---

## 5. Bank Detail APIs

**Note:** One-to-One relationship with User (one bank detail per user)

### Create Bank Detail
- **POST** `/api/bank-details`
- **Auth Required:** Yes
- **Body:**
```json
{
  "userId": "uuid (required)",
  "bankName": "string",
  "accountNumber": "string",
  "ifscCode": "string",
  "accountType": "string"
}
```

### Get All Bank Details
- **GET** `/api/bank-details`
- **Auth Required:** Yes

### Get Bank Detail by User ID
- **GET** `/api/bank-details/user/:userId`
- **Auth Required:** Yes

### Get Bank Detail by ID
- **GET** `/api/bank-details/:id`
- **Auth Required:** Yes

### Update Bank Detail
- **PUT** `/api/bank-details/:id`
- **Auth Required:** Yes
- **Body:**
```json
{
  "bankName": "string",
  "accountNumber": "string",
  "ifscCode": "string",
  "accountType": "string"
}
```

### Delete Bank Detail
- **DELETE** `/api/bank-details/:id`
- **Auth Required:** Yes

---

## 6. Emergency Contact APIs

**Note:** One-to-One relationship with User (one emergency contact per user)

### Create Emergency Contact
- **POST** `/api/emergency-contacts`
- **Auth Required:** Yes
- **Body:**
```json
{
  "userId": "uuid (required)",
  "name": "string",
  "phoneNumber": "string",
  "relation": "string"
}
```

### Get All Emergency Contacts
- **GET** `/api/emergency-contacts`
- **Auth Required:** Yes

### Get Emergency Contact by User ID
- **GET** `/api/emergency-contacts/user/:userId`
- **Auth Required:** Yes

### Get Emergency Contact by ID
- **GET** `/api/emergency-contacts/:id`
- **Auth Required:** Yes

### Update Emergency Contact
- **PUT** `/api/emergency-contacts/:id`
- **Auth Required:** Yes
- **Body:**
```json
{
  "name": "string",
  "phoneNumber": "string",
  "relation": "string"
}
```

### Delete Emergency Contact
- **DELETE** `/api/emergency-contacts/:id`
- **Auth Required:** Yes

---

## 7. Family Member APIs

**Note:** One-to-Many relationship with User (multiple family members per user)

### Create Family Member
- **POST** `/api/family-members`
- **Auth Required:** Yes
- **Body:**
```json
{
  "userId": "uuid (required)",
  "name": "string",
  "dob": "date (YYYY-MM-DD)",
  "relation": "string"
}
```

### Get All Family Members
- **GET** `/api/family-members`
- **Auth Required:** Yes

### Get Family Members by User ID
- **GET** `/api/family-members/user/:userId`
- **Auth Required:** Yes

### Get Family Member by ID
- **GET** `/api/family-members/:id`
- **Auth Required:** Yes

### Update Family Member
- **PUT** `/api/family-members/:id`
- **Auth Required:** Yes
- **Body:**
```json
{
  "name": "string",
  "dob": "date (YYYY-MM-DD)",
  "relation": "string"
}
```

### Delete Family Member
- **DELETE** `/api/family-members/:id`
- **Auth Required:** Yes

---

## 8. Nominee APIs

**Note:** One-to-One relationship with User (one nominee per user)

### Create Nominee
- **POST** `/api/nominees`
- **Auth Required:** Yes
- **Body:**
```json
{
  "userId": "uuid (required)",
  "name": "string",
  "city": "string",
  "state": "string",
  "relation": "string"
}
```

### Get All Nominees
- **GET** `/api/nominees`
- **Auth Required:** Yes

### Get Nominee by User ID
- **GET** `/api/nominees/user/:userId`
- **Auth Required:** Yes

### Get Nominee by ID
- **GET** `/api/nominees/:id`
- **Auth Required:** Yes

### Update Nominee
- **PUT** `/api/nominees/:id`
- **Auth Required:** Yes
- **Body:**
```json
{
  "name": "string",
  "city": "string",
  "state": "string",
  "relation": "string"
}
```

### Delete Nominee
- **DELETE** `/api/nominees/:id`
- **Auth Required:** Yes

---

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

---

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. All endpoints require authentication except auth endpoints
2. All POST/PUT requests should have `Content-Type: application/json` header (except file uploads)
3. File uploads use `Content-Type: multipart/form-data`
4. User creation is only available through:
   - Authentication flow (signup)
   - Bulk upload endpoint
5. One-to-One relationships (BankDetail, EmergencyContact, Nominee):
   - Only one record per user
   - Creating duplicate will return error
6. One-to-Many relationships (Address, FamilyMember):
   - Multiple records per user allowed
7. All timestamps are automatically managed (createdAt, updatedAt)
