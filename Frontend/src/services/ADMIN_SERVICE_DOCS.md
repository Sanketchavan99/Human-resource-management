# Admin Service Documentation

## Overview
The `adminService` provides a consolidated interface for all administrative data management operations. It groups all admin-related API calls into logical categories for easy access and management.

## Usage

```javascript
import { adminService } from '../services';

// Example: Get all users
const response = await adminService.users.getAll();

// Example: Delete a bank detail
const response = await adminService.bankDetails.delete(bankDetailId);
```

## API Reference

### User Management
**Namespace:** `adminService.users`

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all users (excludes admins) | None | Promise<Object> |
| `getById(userId)` | Get user by ID | userId: string | Promise<Object> |
| `update(userId, data)` | Update user | userId: string, data: Object | Promise<Object> |
| `delete(userId)` | Delete user | userId: string | Promise<Object> |
| `bulkUpload(file)` | Bulk upload users from Excel | file: File | Promise<Object> |

### Center Management
**Namespace:** `adminService.centers`

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all centers | None | Promise<Object> |
| `getById(centerId)` | Get center by ID | centerId: string | Promise<Object> |
| `create(data)` | Create new center | data: Object | Promise<Object> |
| `update(centerId, data)` | Update center | centerId: string, data: Object | Promise<Object> |
| `delete(centerId)` | Delete center | centerId: string | Promise<Object> |

**Center Data Structure:**
```javascript
{
  name: "string (required)",
  city: "string",
  state: "string",
  zone: "string"
}
```

### Company Management
**Namespace:** `adminService.companies`

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all companies | None | Promise<Object> |
| `getById(companyId)` | Get company by ID | companyId: string | Promise<Object> |
| `create(data)` | Create new company | data: Object | Promise<Object> |
| `update(companyId, data)` | Update company | companyId: string, data: Object | Promise<Object> |
| `delete(companyId)` | Delete company | companyId: string | Promise<Object> |

**Company Data Structure:**
```javascript
{
  code: "string (required, unique)",
  name: "string"
}
```

### Address Management
**Namespace:** `adminService.addresses`

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all addresses | None | Promise<Object> |
| `getById(addressId)` | Get address by ID | addressId: string | Promise<Object> |
| `getByUserId(userId)` | Get addresses by user ID | userId: string | Promise<Object> |
| `create(data)` | Create new address | data: Object | Promise<Object> |
| `update(addressId, data)` | Update address | addressId: string, data: Object | Promise<Object> |
| `delete(addressId)` | Delete address | addressId: string | Promise<Object> |

**Address Data Structure:**
```javascript
{
  userId: "string (required)",
  type: "Permanent | Current (required)",
  addressLine: "string",
  city: "string",
  state: "string"
}
```

### Bank Detail Management
**Namespace:** `adminService.bankDetails`

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all bank details | None | Promise<Object> |
| `getById(bankDetailId)` | Get bank detail by ID | bankDetailId: string | Promise<Object> |
| `getByUserId(userId)` | Get bank detail by user ID | userId: string | Promise<Object> |
| `create(data)` | Create new bank detail | data: Object | Promise<Object> |
| `update(bankDetailId, data)` | Update bank detail | bankDetailId: string, data: Object | Promise<Object> |
| `delete(bankDetailId)` | Delete bank detail | bankDetailId: string | Promise<Object> |

**Bank Detail Data Structure:**
```javascript
{
  userId: "string (required)",
  accountNumber: "string (required)",
  ifscCode: "string (required)",
  bankName: "string",
  branchName: "string",
  accountHolderName: "string",
  accountType: "Savings | Current"
}
```

### Emergency Contact Management
**Namespace:** `adminService.emergencyContacts`

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all emergency contacts | None | Promise<Object> |
| `getById(contactId)` | Get emergency contact by ID | contactId: string | Promise<Object> |
| `getByUserId(userId)` | Get emergency contact by user ID | userId: string | Promise<Object> |
| `create(data)` | Create new emergency contact | data: Object | Promise<Object> |
| `update(contactId, data)` | Update emergency contact | contactId: string, data: Object | Promise<Object> |
| `delete(contactId)` | Delete emergency contact | contactId: string | Promise<Object> |

**Emergency Contact Data Structure:**
```javascript
{
  userId: "string (required)",
  name: "string (required)",
  relation: "string (required)",
  phoneNumber: "string (required)"
}
```

### Family Member Management
**Namespace:** `adminService.familyMembers`

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all family members | None | Promise<Object> |
| `getById(memberId)` | Get family member by ID | memberId: string | Promise<Object> |
| `getByUserId(userId)` | Get family members by user ID | userId: string | Promise<Object> |
| `create(data)` | Create new family member | data: Object | Promise<Object> |
| `update(memberId, data)` | Update family member | memberId: string, data: Object | Promise<Object> |
| `delete(memberId)` | Delete family member | memberId: string | Promise<Object> |

**Family Member Data Structure:**
```javascript
{
  userId: "string (required)",
  name: "string (required)",
  relation: "Spouse | Father | Mother | Son | Daughter | Brother | Sister | Other (required)",
  dob: "string (required)",
  phoneNumber: "string",
  occupation: "string",
  isDependent: "boolean"
}
```

### Nominee Management
**Namespace:** `adminService.nominees`

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getAll()` | Get all nominees | None | Promise<Object> |
| `getById(nomineeId)` | Get nominee by ID | nomineeId: string | Promise<Object> |
| `getByUserId(userId)` | Get nominees by user ID | userId: string | Promise<Object> |
| `create(data)` | Create new nominee | data: Object | Promise<Object> |
| `update(nomineeId, data)` | Update nominee | nomineeId: string, data: Object | Promise<Object> |
| `delete(nomineeId)` | Delete nominee | nomineeId: string | Promise<Object> |

**Nominee Data Structure:**
```javascript
{
  userId: "string (required)",
  name: "string (required)",
  relation: "string (required)",
  dob: "string",
  phoneNumber: "string",
  address: "string",
  city: "string",
  state: "string",
  sharePercentage: "number (required, total must = 100%)"
}
```

## Response Format

All service methods return a Promise that resolves to an Axios response object:

```javascript
{
  data: {
    success: boolean,
    message: string,
    data: Object | Array
  },
  status: number,
  statusText: string,
  headers: Object,
  config: Object
}
```

## Error Handling

All methods include try-catch blocks and return error responses:

```javascript
try {
  const response = await adminService.users.getAll();
  if (response?.data?.success) {
    // Handle success
    const users = response.data.data;
  } else {
    // Handle API error
    console.error(response?.data?.message);
  }
} catch (error) {
  // Handle network error
  console.error(error);
}
```

## Examples

### Get All Users and Filter by Role
```javascript
const response = await adminService.users.getAll();
if (response?.data?.success) {
  const employees = response.data.data.filter(u => u.role === 'employee');
  console.log(`Found ${employees.length} employees`);
}
```

### Create a New Center
```javascript
const centerData = {
  name: "Mumbai Office",
  city: "Mumbai",
  state: "Maharashtra",
  zone: "West"
};

const response = await adminService.centers.create(centerData);
if (response?.data?.success) {
  console.log('Center created:', response.data.data);
}
```

### Delete Multiple Items
```javascript
const deleteItems = async (ids, service) => {
  for (const id of ids) {
    await service.delete(id);
  }
};

// Delete multiple bank details
await deleteItems([id1, id2, id3], adminService.bankDetails);
```

## Data Management Component

The `DataManagement` component provides a comprehensive UI for managing all data types:

```javascript
import DataManagement from '../components/admin/DataManagement';

// Use in Admin page
<DataManagement />
```

**Features:**
- Tabbed interface for different data types
- View all records with pagination
- Delete functionality with confirmation
- Refresh button to reload data
- Loading states and empty states
- Responsive table layout

## Best Practices

1. **Always check response.data.success** before accessing data
2. **Handle errors gracefully** with user-friendly messages
3. **Confirm destructive actions** (deletes, updates) with the user
4. **Refresh data** after mutations (create, update, delete)
5. **Use loading states** to provide feedback during async operations
6. **Validate data** before sending to the API
7. **Use type checking** if using TypeScript

## Security Considerations

- All admin endpoints require authentication (JWT token)
- Admin-only endpoints require `adminOnly` middleware
- Users can only access their own data (except admins)
- Sensitive fields (password, OTP, etc.) are excluded from responses
- File uploads are validated for type and size
