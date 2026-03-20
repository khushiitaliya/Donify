# Hospital Schema & Management System

## Overview

A dedicated **Hospital** MongoDB collection has been created to properly manage hospital records. Each hospital user who signs up gets:
1. A **User** document (for authentication)
2. A **Hospital** document (for hospital-specific profile and data)

## Hospital Schema

### Location: `backend/models/Hospital.js`

```javascript
{
  // User Reference
  userId: ObjectId (required, unique) // Link to User model

  // Basic Information
  name: String (required, max 100)
  email: String (required, unique)
  phone: String (required, matches phone regex)
  location: String (required)
  
  // Address Details
  address: {
    street: String
    city: String
    state: String  
    zipCode: String
    country: String
  }

  // Hospital Classification
  hospitalType: String enum ['Government', 'Private', 'NGO', 'Medical Institute']
  registrationNumber: String (unique)
  licenseNumber: String

  // Contact Information
  contactPerson: String (required)
  contactPersonPhone: String (required)
  emergencyContact: String (required)
  emergencyContactPhone: String (required)

  // Blood Inventory (Units Available)
  bloodInventory: {
    'A+': Number (default 0)
    'A-': Number (default 0)
    'B+': Number (default 0)
    'B-': Number (default 0)
    'AB+': Number (default 0)
    'AB-': Number (default 0)
    'O+': Number (default 0)
    'O-': Number (default 0)
  }

  // Statistics
  stats: {
    totalRequestsCreated: Number (default 0)
    totalDonationsReceived: Number (default 0)
    totalDonationsCancelled: Number (default 0)
    averageFulfillmentTime: Number (in hours)
    lastRequestDate: Date
  }

  // Departments
  departments: [{
    name: String
    headName: String
    headPhone: String
    headEmail: String
  }]

  // Verification
  isVerified: Boolean (default false)
  verificationStatus: String enum ['pending', 'verified', 'suspended', 'rejected']
  verificationDate: Date

  // Status
  isActive: Boolean (default true)

  // Profile
  hospitalLogo: String (URL)
  description: String (max 1000)
  website: String

  // Services
  servicesOffered: String[] enum ['Blood Bank', 'Emergency', 'Surgery', 'ICU', 'Trauma Center', 'Organ Transplant']

  // Team
  teamMembers: [{
    name: String
    role: String
    email: String
    phone: String
  }]

  // Timestamps
  createdAt: Date (default now)
  updatedAt: Date (default now)
}
```

## End-to-End Hospital Registration Flow

### 1. Hospital Signs Up

**Frontend**: User fills signup form as hospital
```json
{
  "name": "City Hospital",
  "email": "city@hospital.com",
  "password": "password123",
  "phone": "9876543210",
  "location": "Surat",
  "role": "hospital"
}
```

**POST /api/auth/register**

### 2. Backend Creates Two Documents

**A. User Document** (for authentication)
```json
{
  "_id": ObjectId("..."),
  "name": "City Hospital",
  "email": "city@hospital.com",
  "password": "hashed_password",
  "role": "hospital",
  "phone": "9876543210",
  "isVerified": false
}
```

**B. Hospital Document** (for hospital profile)
```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),      // links to User
  "name": "City Hospital",
  "email": "city@hospital.com",
  "phone": "9876543210",
  "location": "Surat",
  "contactPerson": "City Hospital",
  "contactPersonPhone": "9876543210",
  "emergencyContact": "City Hospital",
  "emergencyContactPhone": "9876543210",
  "hospitalsType": "Private",
  "stats": {
    "totalRequestsCreated": 0,
    "totalDonationsReceived": 0
  },
  "bloodInventory": {
    "A+": 0, "A-": 0, "B+": 0, ...
  }
}
```

### 3. Hospital Logs In

**POST /api/auth/login** → Returns JWT token

### 4. Hospital Creates Blood Request

**POST /api/hospitals/requests**
- Backend creates BloodRequest document
- BloodRequest.hospital = Hospital User's _id
- BloodRequest.hospitalName = Hospital name (from User or Hospital doc)

### 5. Hospital Profile Management

**GET /api/hospitals/profile** - Get hospital's full profile
**PUT /api/hospitals/profile** - Update hospital profile details

## API Endpoints

### Public Endpoints

#### Get All Hospitals
```
GET /api/hospitals/list?page=1&limit=10&location=Surat
```

**Response:**
```json
{
  "hospitals": [
    {
      "_id": "...",
      "name": "City Hospital",
      "location": "Surat",
      "hospitalType": "Private",
      "description": "...",
      "hospitalLogo": "...",
      "servicesOffered": ["Blood Bank", "Emergency"],
      "bloodInventory": { "A+": 5, "B+": 3, ... },
      "stats": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Get Hospital Details
```
GET /api/hospitals/detail/{hospitalId}
```

### Protected Endpoints (Hospital Auth Required)

#### Get Hospital Profile
```
GET /api/hospitals/profile
Authorization: Bearer {token}
```

#### Update Hospital Profile
```
PUT /api/hospitals/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "contactPerson": "Dr. Sharma",
  "contactPersonPhone": "9876543210",
  "emergencyContact": "Manager",
  "emergencyContactPhone": "9876543211",
  "description": "A leading multi-specialty hospital...",
  "hospitalType": "Private"
}
```

#### Get Hospital Dashboard
```
GET /api/hospitals/dashboard
Authorization: Bearer {token}
```

#### Create Blood Request
```
POST /api/hospitals/requests
Authorization: Bearer {token}

{
  "bloodGroup": "B+",
  "quantity": 2,
  "urgency": "high",
  "location": "Surat",
  "patientName": "John Doe",
  "patientAge": 45,
  "patientGender": "male",
  "reason": "Post-surgery recovery",
  "contactPerson": "Dr. Sharma",
  "contactPhone": "9876543210"
}
```

#### Get Hospital Statistics
```
GET /api/hospitals/stats
Authorization: Bearer {token}
```

## Methods Available on Hospital Schema

### `getTotalInventory()`
Returns total blood units available
```javascript
const totalUnits = hospital.getTotalInventory(); // 10
```

### `hasBloodType(bloodGroup)`
Check if hospital has specific blood type
```javascript
const hasB = hospital.hasBloodType('B+'); // true/false
```

### `reduceBloodInventory(bloodGroup, quantity)`
Reduce blood inventory after donation
```javascript
await hospital.reduceBloodInventory('B+', 2);
// Updates bloodInventory['B+'] -= 2
// Updates stats.totalDonationsReceived += 2
```

## Database Queries

### Find All Hospitals by Location
```javascript
db.hospitals.find({ location: "Surat", isActive: true })
```

### Find Verified Hospitals
```javascript
db.hospitals.find({ verificationStatus: "verified" })
```

### Find Hospitals with Specific Services
```javascript
db.hospitals.find({ servicesOffered: "Blood Bank" })
```

### Get Blood Group Inventory for a Hospital
```javascript
db.hospitals.findOne({ 
  _id: ObjectId("...") 
}, { 
  bloodInventory: 1 
})
```

### Get Hospitals by Request Count
```javascript
db.hospitals.aggregate([
  {
    $addFields: {
      totalRequests: "$stats.totalRequestsCreated"
    }
  },
  { $sort: { totalRequests: -1 } }
])
```

## Testing Hospital Features

### 1. Create Hospital Account (Signup)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "email": "test@hospital.com",
    "password": "Test@123",
    "phone": "9876543210",
    "location": "Mumbai",
    "role": "hospital"
  }'
```

**Result:** Creates both User and Hospital documents

### 2. Get Hospital Profile
```bash
curl -X GET http://localhost:5000/api/hospitals/profile \
  -H "Authorization: Bearer {token}"
```

### 3. Update Hospital Profile
```bash
curl -X PUT http://localhost:5000/api/hospitals/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "contactPerson": "Dr. Smith",
    "description": "State-of-the-art hospital"
  }'
```

### 4. List All Hospitals
```bash
curl -X GET http://localhost:5000/api/hospitals/list
```

### 5. Get Hospital Details
```bash
curl -X GET http://localhost:5000/api/hospitals/detail/{hospitalId}
```

## Migration from Old System

### Before (Hospital in User Collection)
```json
{
  "_id": ObjectId("..."),
  "name": "City Hospital",
  "email": "city@hospital.com",
  "role": "hospital",
  "phone": "9876543210",
  "location": "Surat",
  // All hospital data mixed with user auth data
}
```

### After (Separate Collections)
**User:**
```json
{
  "_id": ObjectId("..."),
  "name": "City Hospital",
  "email": "city@hospital.com",
  "role": "hospital",
  "phone": "9876543210"
}
```

**Hospital:**
```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "name": "City Hospital",
  "email": "city@hospital.com",
  "phone": "9876543210",
  "location": "Surat",
  "bloodInventory": { ... },
  "stats": { ... }
  // All hospital-specific data
}
```

## Benefits of Separate Hospital Schema

1. **Separation of Concerns**
   - User = Authentication & Role
   - Hospital = Business Data & Operations

2. **Better Query Performance**
   - Query hospitals without auth overhead
   - Faster hospital list retrieval

3. **Scalability**
   - Independent indexes on hospital collection
   - Better organization of hospital-specific data

4. **Rich Data**
   - Blood inventory tracking
   - Statistics & performance metrics
   - Team member management
   - Service offerings

5. **Flexibility**
   - Add hospital-specific features independently
   - Modify hospital schema without affecting auth

## Future Enhancements

- [ ] Hospital dashboard with blood inventory management
- [ ] Blood ordering from other hospitals
- [ ] Hospital ratings & reviews
- [ ] Integration with blood bank management system
- [ ] Real-time inventory synchronization across hospitals
- [ ] Hospital analytics & reporting
- [ ] Multi-user support per hospital (admin, staff)

---

**Status:** ✅ **IMPLEMENTATION COMPLETE**

New hospitals are automatically saved to the dedicated Hospital collection with all profile information and blood inventory tracking capabilities.
