# Donify Architecture - Hospital Schema Integration

## Database Collections Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Collections                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │      User        │        │    Hospital      │            │
│  ├──────────────────┤        ├──────────────────┤            │
│  │ _id: ObjectId    │        │ _id: ObjectId    │            │
│  │ name: String     │◄───[userId]──connection  │            │
│  │ email: String    │        │ name: String     │            │
│  │ password: Hash   │        │ email: String    │            │
│  │ role: 'hospital' │        │ phone: String    │            │
│  │ phone: String    │        │ location: String │            │
│  │ createdAt: Date  │        │ bloodInventory   │            │
│  │                  │        │ stats: {}        │            │
│  └──────────────────┘        │ departments: []  │            │
│           ▲                  │ teamMembers: []  │            │
│           │                  │ services: []     │            │
│           │                  │ createdAt: Date  │            │
│           │                  └──────────────────┘            │
│           │                                                   │
│      [1:1 Link for                                            │
│       Hospital Users]                                         │
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │   BloodRequest   │        │    Donation      │            │
│  ├──────────────────┤        ├──────────────────┤            │
│  │ _id: ObjectId    │        │ _id: ObjectId    │            │
│  │ hospital: Ref◄─ Linked◄─ hospital: Ref     │            │
│  │ bloodGroup       │        │ donor: Ref       │            │
│  │ quantity         │        │ bloodRequest: Ref│            │
│  │ urgency          │        │ units: Number    │            │
│  │ patientName      │        │ status           │            │
│  │ urgencyScore     │        │ createdAt        │            │
│  │ matchedDonors[]  │        │                  │            │
│  │ createdAt        │        └──────────────────┘            │
│  └──────────────────┘                                         │
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │      Donor       │        │     Admin        │            │
│  │    (in User)     │        │    (in User)     │            │
│  ├──────────────────┤        ├──────────────────┤            │
│  │ role: 'donor'    │        │ role: 'admin'    │            │
│  │ bloodGroup       │        │ permissions      │            │
│  │ location         │        │                  │            │
│  │ lastDonation     │        │                  │            │
│  │ totalDonations   │        └──────────────────┘            │
│  │ points           │                                         │
│  └──────────────────┘                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Request Flow: Hospital Registration to Blood Request

```
┌─────────────────────────────────────────────────────────────┐
│                    User (Hospital)                          │
│              Fills Signup Form                              │
│  {name, email, password, phone, location, role='hospital'} │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│        POST /api/auth/register                              │
│        (Backend: auth.js)                                   │
└──────────────┬──────────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
  ┌──────────┐  ┌──────────────┐
  │  Create  │  │   Create     │
  │   User   │  │   Hospital   │
  │Document  │  │   Document   │
  │          │  │              │
  │validated │  │  bloodInv    │
  │hashed    │  │  stats       │
  │password  │  │  contact     │
  └────┬─────┘  │  info        │
       │        └───┬──────────┘
       │            │
       ▼            ▼
   MongoDB: users    MongoDB: hospitals
   [User doc]        [Hospital doc + userId ref]
       │
       └──────────┬─────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Return JWT Token│
         └─────────┬───────┘
                   │
         ┌─────────▼──────────┐
         │ Hospital Logged In │
         │ Can create requests│
         └────────┬───────────┘
                  │
                  ▼
     ┌──────────────────────────┐
     │GET /api/hospitals/profile│ (Retrieves Hospital doc)
     │PUT /api/hospitals/profile│ (Updates Hospital doc)
     │POST /api/hospitals/requests│ (Creates BloodRequest)
     └──────────────────────────┘
```

## Hospital Data Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  HOSPITAL DATA LIFECYCLE                                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  SIGNUP PHASE                                               │
│  ─────────────────────────────────────────────────────────  │
│  Hospital fills form → POST /api/auth/register              │
│  ↓                                                            │
│  User doc created: {name, email, role, phone, password}    │
│  Hospital doc created: {userId, name, email, phone,        │
│                         location, bloodInventory, stats}    │
│                                                               │
│  ↓                                                            │
│  LOGIN PHASE                                                │
│  ──────────────────────────────────────────────────────────  │
│  Hospital logs in: POST /api/auth/login                     │
│  ↓                                                            │
│  Returns JWT token (via User._id)                           │
│  Token stored in localStorage                               │
│                                                               │
│  ↓                                                            │
│  DASHBOARD PHASE                                            │
│  ──────────────────────────────────────────────────────────  │
│  GET /api/hospitals/profile                                 │
│  ↓ (Query: Hospital.findOne({ userId: req.user._id }))    │
│  Returns Hospital document with:                            │
│  - All profile info                                           │
│  - Blood inventory                                            │
│  - Statistics                                                │
│  - Departments & team                                        │
│                                                               │
│  ↓                                                            │
│  PROFILE UPDATE PHASE                                       │
│  ──────────────────────────────────────────────────────────  │
│  PUT /api/hospitals/profile {contactPerson, description...} │
│  ↓                                                            │
│  Hospital document updated                                   │
│  ↓                                                            │
│  Hospital can now upload logo, add departments, etc.        │
│                                                               │
│  ↓                                                            │
│  BLOOD REQUEST PHASE                                        │
│  ──────────────────────────────────────────────────────────  │
│  POST /api/hospitals/requests                               │
│  {bloodGroup, quantity, urgency, patient info...}           │
│  ↓                                                            │
│  Backend creates BloodRequest:                              │
│  - hospital: User._id (hospital user's ID)                 │
│  - hospitalName: Hospital.name                              │
│  - patientName, patientAge, patientGender, reason           │
│  - urgencyScore: calculated by server                       │
│  - matchedDonors: arrays of donor matches                   │
│  ↓                                                            │
│  MongoDB: bloodrequests collection                          │
│  [BloodRequest doc created with hospital reference]         │
│                                                               │
│  ↓                                                            │
│  DONOR MATCHING & NOTIFICATION PHASE                        │
│  ──────────────────────────────────────────────────────────  │
│  Server finds matching donors:                              │
│  - Same blood group                                          │
│  - Same location                                             │
│  - Available (not in cooldown)                               │
│  ↓                                                            │
│  Notify donors via SMS/Email                                │
│  ↓                                                            │
│  Dashboard shows:                                            │
│  - Request created ✓                                         │
│  - X donors notified                                         │
│  - Top matching donors shown                                 │
│                                                               │
│  ↓                                                            │
│  DONOR RESPONSE PHASE                                       │
│  ──────────────────────────────────────────────────────────  │
│  Donor sees notification → clicks to accept/decline        │
│  ↓                                                            │
│  BloodRequest.acceptedBy = Donor._id                        │
│  BloodRequest.status = 'accepted'                           │
│  ↓                                                            │
│  Hospital notified                                           │
│  Gets donor details for coordination                         │
│                                                               │
│  ↓                                                            │
│  COMPLETION & STATS PHASE                                   │
│  ──────────────────────────────────────────────────────────  │
│  Hospital marks donation as complete                        │
│  ↓                                                            │
│  BloodRequest.status = 'completed'                          │
│  Hospital.stats.totalDonationsReceived += quantity          │
│  Hospital.bloodInventory['B+'] += quantity                  │
│  Donor.stats.totalDonations += 1                            │
│  Donor eligible for next donation after cooldown            │
│                                                               │
│  ↓                                                            │
│  ANALYTICS PHASE                                            │
│  ──────────────────────────────────────────────────────────  │
│  Dashboard shows:                                            │
│  - Blood group statistics                                    │
│  - Monthly trends                                            │
│  - Urgency distribution                                      │
│  - All tracked in Hospital.stats                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoint Map

```
AUTHENTICATION
│
├─ POST /api/auth/register
│  │ Input: {name, email, password, phone, location, role}
│  │ Creates: User + Hospital (if role='hospital')
│  └─ Output: {token, user}
│
├─ POST /api/auth/login
│  │ Input: {email, password}
│  └─ Output: {token, user}
│
└─ POST /api/auth/logout [Protected]
   └─ Output: {message}

HOSPITAL MANAGEMENT
│
├─ [PUBLIC] GET /api/hospitals/list
│  │ Query: page, limit, location
│  └─ Output: {hospitals[], pagination}
│
├─ [PUBLIC] GET /api/hospitals/detail/:id
│  └─ Output: {hospital}
│
├─ [PROTECTED] GET /api/hospitals/profile
│  │ Returns logged-in hospital's profile
│  └─ Output: {hospital}
│
├─ [PROTECTED] PUT /api/hospitals/profile
│  │ Input: {contactPerson, description, hospitalType...}
│  └─ Output: {hospital}
│
├─ [PROTECTED] GET /api/hospitals/dashboard
│  │ Returns stats, recent requests, blood inventory
│  └─ Output: {hospital, stats, recentRequests, recentDonations}
│
├─ [PROTECTED] GET /api/hospitals/stats
│  │ Advanced statistics: blood group demand, trends, urgency
│  └─ Output: {bloodGroupStats, monthlyTrends, urgencyStats}
│
├─ [PROTECTED] GET /api/hospitals/requests
│  │ Query: page, limit, status
│  └─ Output: {requests[], pagination}
│
└─ [PROTECTED] GET /api/hospitals/donations
   │ Query: page, limit, status
   └─ Output: {donations[], pagination}

BLOOD REQUESTS
│
├─ [PROTECTED] POST /api/hospitals/requests
│  │ Input: {bloodGroup, quantity, urgency, patientName,
│  │         patientAge, patientGender, reason, contactPerson}
│  │ Creates: BloodRequest document
│  │ Calculates: urgency score, matches donors, sends notifications
│  └─ Output: {message, bloodRequest}
│
├─ [PROTECTED] GET /api/hospitals/requests/:requestId
│  └─ Output: {request}
│
├─ [PROTECTED] PUT /api/hospitals/requests/:requestId
│  │ Input: {status, notes}
│  │ Updates: BloodRequest status (completed/cancelled)
│  └─ Output: {message, bloodRequest}
│
└─ [PUBLIC] GET /api/requests
   │ Query: page, limit, bloodGroup, location, urgency
   │ Returns: All public blood requests
   └─ Output: {requests[], pagination}

DONATIONS
│
├─ [PROTECTED] GET /api/hospitals/donations/:donationId
│  └─ Output: {donation}
│
└─ [PROTECTED] PUT /api/hospitals/donations/:donationId/complete
   │ Input: {healthCheck, staffMember}
   │ Updates: Donation status, donor records, blood inventory
   └─ Output: {message, donation}
```

## Key Integration Points

### 1. Hospital Creation (Signup)
```
auth.js register → Creates User → Creates Hospital → Hospital.userId = User._id
```

### 2. Hospital Authentication
```
auth.js login → Finds User → Returns User._id in JWT
```

### 3. Get Hospital Profile
```
Hospital.findOne({ userId: req.user._id }) → Gets complete hospital document
```

### 4. Create Blood Request
```
POST /hospitals/requests → 
  Create BloodRequest with hospital: req.user._id →
  Fill with Hospital name from Hospital collection →
  Calculate urgency score →
  Find donor matches →
  Send notifications
```

### 5. Update Blood Inventory
```
BloodRequest completed →
  Hospital.bloodInventory['B+'] += quantity →
  Hospital.stats.totalDonationsReceived += quantity →
  Save Hospital document
```

## Security Features

```
┌─────────────────────────────────────┐
│   Authentication & Authorization    │
├─────────────────────────────────────┤
│                                      │
│ JWT Tokens (30 days): Passed in     │
│ Authorization: Bearer {token}        │
│                                      │
│ Authorization Middleware:            │
│ - auth: Requires valid JWT          │
│ - authorize('hospital'): Checks role │
│                                      │
│ Password: Hashed with bcryptjs      │
│ Email: Unique, validated, normalized│
│                                      │
│ Phone: Validated with regex          │
│ Blood Group: Validated enum          │
│ Role: Validated enum                 │
│                                      │
│ Hospital can only:                   │
│ - View own profile                   │
│ - Update own requests                │
│ - Manage own donations               │
│ - Not access other hospital's data   │
│                                      │
└─────────────────────────────────────┘
```

## Performance Optimizations

1. **Separate Collections**: Hospital queries don't scan User collection
2. **Indexes**: email (unique) on both User and Hospital
3. **Pagination**: All list endpoints paginated
4. **Projection**: Select only needed fields in queries
5. **Lean Queries**: For read-only operations
6. **Aggregation Pipeline**: For complex statistics
7. **Caching**: Hospital profile cached in Hospital document

---

**Last Updated**: March 20, 2026
**Status**: ✅ Complete & Operational
