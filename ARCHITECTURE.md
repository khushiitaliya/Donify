# Donify Notification System Architecture

## System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        DONIFY PLATFORM                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐          ┌──────────────────────────┐  │
│  │   HOSPITAL UI    │          │     DONOR UI             │  │
│  ├──────────────────┤          ├──────────────────────────┤  │
│  │  Create Request  │          │ View Preferences         │  │
│  │  - Blood Group   │──────┐   │ - SMS Toggle             │  │
│  │  - Quantity      │      │   │ - WhatsApp Toggle        │  │
│  │  - Location      │      │   │ - Email Toggle           │  │
│  │  - Urgency       │      │   │ - Urgency Filter         │  │
│  └──────────────────┘      │   └──────────────────────────┘  │
│                        ┌───▼──────────┐                      │
│                        │  AuthContext │                      │
│                        │   (Redux)    │                      │
│                        └───┬──────────┘                      │
│                            │                                │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼───────┐  ┌──────▼──────┐  ┌────────▼────┐       │
│    │ createReq  │  │ setDonors    │  │ setRequests │       │
│    │ function   │  │              │  │             │       │
│    └────┬───────┘  └──────┬───────┘  └────────┬────┘       │
│         │                 │                   │             │
│         └─────────────────┼───────────────────┘             │
│                           │                                │
│                 ┌─────────▼──────────┐                     │
│                 │ Notification       │                     │
│                 │ Service            │                     │
│                 └─────────┬──────────┘                     │
│                           │                                │
│         ┌─────────────────┼─────────────────┐              │
│         │                 │                 │              │
│    ┌────▼────┐      ┌─────▼──────┐   ┌─────▼────┐        │
│    │ findBest │      │ Blood      │   │ Notify   │        │
│    │ Matches  │      │ Matching   │   │ Donor    │        │
│    └────┬─────┘      │ Service    │   └─────┬────┘        │
│         │            └────────────┘         │              │
│         └──────────────┬────────────────────┘              │
│                        │                                  │
│         ┌──────────────┼──────────────────┐               │
│         │              │                  │               │
│    ┌────▼───┐     ┌────▼────┐     ┌──────▼────┐         │
│    │  SMS   │     │WhatsApp  │     │  Email   │         │
│    │Twilio  │     │ Twilio   │     │SendGrid  │         │
│    └────┬───┘     └────┬─────┘     └──────┬───┘         │
│         │              │                  │              │
└─────────┼──────────────┼──────────────────┼──────────────┘
          │              │                  │
    ┌─────▼──┐      ┌────▼────┐      ┌─────▼──┐
    │ Donor  │      │ Donor   │      │Donor  │
    │ SMS    │      │WhatsApp │      │Email  │
    └────────┘      └─────────┘      └───────┘
```

## Data Flow Diagram

```
HOSPITAL REQUEST CREATION
    ║
    ║ Step 1: Hospital Creates Request
    ╟─ Blood Group, Quantity, Urgency, Location
    ║
    ▼
CREATE_REQUEST ACTION
    ║
    ╟─ Generate Request ID
    ╟─ Set Status: "Sent"
    ╟─ Set Expiry: +48 hours
    ║
    ▼
FIND MATCHING DONORS
    ║
    ╟─ bloodMatchingService.findBestMatches()
    ╟─ Validate blood type compatibility
    ╟─ Calculate match scores (0-100)
    ║   ├─ 50% Blood group compatibility
    ║   ├─ 25% Location proximity
    ║   └─ 25% Donor availability
    ╟─ Sort by score (highest first)
    ╟─ Select top 5 matches
    ║
    ▼
FILTER BY DONOR PREFERENCES
    ║
    ╟─ For each matching donor:
    ║   ├─ Check notification preferences
    ║   │  ├─ SMS enabled?
    ║   │  ├─ WhatsApp enabled?
    ║   │  └─ Email enabled?
    ║   │
    ║   └─ Check urgency filter
    ║      ├─ "All" → Always send
    ║      ├─ "High" → Send if High or Critical
    ║      └─ "Critical" → Send if Critical only
    ║
    ║   If no channels enabled → Skip donor
    ║
    ▼
SEND NOTIFICATIONS
    ║
    ╟─ Create message content
    ║   ├─ SMS: Concise alert (160 chars)
    ║   ├─ WhatsApp: Formatted message
    ║   └─ Email: HTML template
    ║
    ╟─ Send enabled channels in parallel
    ║
    ├─► SEND_SMS
    │   ├─ Via: Twilio API
    │   ├─ To: Donor phone number
    │   └─ Status: Success/Failed/Simulated
    │
    ├─► SEND_WHATSAPP
    │   ├─ Via: Twilio WhatsApp API
    │   ├─ To: Donor phone number
    │   └─ Status: Success/Failed/Simulated
    │
    └─► SEND_EMAIL
        ├─ Via: SendGrid API
        ├─ To: Donor email address
        └─ Status: Success/Failed/Simulated
    ║
    ▼
TRACK DELIVERY STATUS
    ║
    ╟─ Update request.notificationsSent array
    ╟─ Log to localStorage
    ╟─ Add to donor.notificationLog
    ║
    ▼
SHOW CONFIRMATION TO HOSPITAL
    ║
    ╟─ Display notification status modal
    ╟─ Show donor names and status
    ╟─ Show channels used per donor
    ║
    ▼
END - DONORS RECEIVE NOTIFICATIONS
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────┐
│         HospitalDashboard (Page)                    │
│ ┌────────────────────────────────────────────────┐  │
│ │ Renders:                                       │  │
│ │ - Stats (Active Requests, Available Donors)   │  │
│ │ - Create Request Form                         │  │
│ │ - Hospital Requests List                      │  │
│ │ - Available Donors                            │  │
│ └────────────────────────────────────────────────┘  │
│         ▲                               │            │
│         │                               │            │
│    useAuth()                    handleCreateRequest│
│         │                       (trigger)           │
│         │                               │            │
│         └───────────────┬───────────────┘            │
│                         │                           │
│                         ▼                           │
│              AuthContext.createRequest()           │
└─────────────────────────────────────────────────────┘
                         │
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐  ┌──────────────┐  ┌─────────────┐
    │ Create │  │ findBestMatches
    │Request │  │ (matching)   │  │ Preferences │
    │Object  │  │              │  │ Check       │
    └────────┘  └──────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
              NotificationService
         sendNotificationsToMatchingDonors()
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    sendSMS()    sendWhatsApp()   sendEmail()
         │               │               │
         │               │               │
    Twilio API    Twilio WhatsApp  SendGrid API
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
              Update Request with Status
                         │
                         ▼
       Update localStorage notification logs
                         │
                         ▼
         Show confirmation to Hospital
                (Modal component)
```

## Service Architecture

### NotificationService Hierarchy

```
NotificationService (Singleton)
│
├── Settings
│   ├── SMS Config
│   │   ├── accountSid
│   │   ├── authToken
│   │   ├── fromNumber
│   │   └── enabled
│   │
│   ├── WhatsApp Config
│   │   ├── accountSid
│   │   ├── authToken
│   │   ├── fromNumber
│   │   └── enabled
│   │
│   └── Email Config
│       ├── apiKey
│       ├── fromEmail
│       └── enabled
│
├── Methods
│   ├── sendSMS()
│   ├── sendWhatsApp()
│   ├── sendEmail()
│   ├── notifyDonor()
│   ├── generateSMSMessage()
│   ├── generateEmailContent()
│   └── logNotification()
│
└── Utilities
    ├── getStatus()
    ├── setChannelEnabled()
    └── Message Templates
```

### BloodMatchingService Hierarchy

```
bloodMatchingService (Utility Object)
│
├── Constants
│   └── bloodTypeCompatibility
│       ├── O-:  { universal: true }
│       ├── O+:  { canDonateTo: [...] }
│       ├── A-:  { canDonateTo: [...] }
│       ├── A+:  { canDonateTo: [...] }
│       ├── B-:  { canDonateTo: [...] }
│       ├── B+:  { canDonateTo: [...] }
│       ├── AB-: { canDonateTo: [...] }
│       └── AB+: { universal: true }
│
└── Methods
    ├── canDonate(donorType, recipientType)
    │   └── Returns: boolean
    │
    ├── getCompatibleDonors(bloodGroup, donors)
    │   └── Returns: filtered donors array
    │
    ├── calculateMatchScore(request, donor)
    │   └── Returns: { score, details }
    │
    └── findBestMatches(request, donors, limit)
        └── Returns: sorted donors array with scores
```

## State Management Flow

```
INITIAL STATE
├── users: []
├── donors: []
├── hospitals: []
├── requests: []
├── currentUser: null
├── notifications: []
└── auditLogs: []

WHEN HOSPITAL CREATES REQUEST
├── requests: [...prev, newRequest]
├── notifications: adding success message
├── auditLogs: adding create_request entry
│
└── WHEN NOTIFICATIONS SENT
    ├── donors: updated with notification logs
    ├── requests: updated with notificationsSent array
    ├── notifications: adding success/error message
    └── auditLogs: adding notification entry
```

## Database/Storage Structure

```
localStorage Keys:
├── donify_users
│   └── [{ id, role, email, password, ... }]
│
├── donify_donors
│   └── [{ id, name, bloodGroup, ..., notificationLog: [] }]
│
├── donify_hospitals
│   └── [{ id, name, location, ... }]
│
├── donify_requests
│   └── [{ id, status, notificationsSent: [], ... }]
│
├── donify_current
│   └── { id, name, role, ... }
│
├── donify_audits
│   └── [{ id, type, by, timestamp, meta }]
│
├── donify_notification_prefs
│   └── { sms, whatsapp, email, urgencyFilter }
│
└── donify_notification_logs
    └── [{ timestamp, type, recipient, status, ... }]
```

## Security Architecture

```
┌──────────────────────────────────┐
│    Environment Variables (.env)  │
├──────────────────────────────────┤
│ TWILIO_ACCOUNT_SID               │
│ TWILIO_AUTH_TOKEN                │
│ TWILIO_PHONE_NUMBER              │
│ SENDGRID_API_KEY                 │
│ FROM_EMAIL                       │
└──────────────┬───────────────────┘
               │
        ❌ NEVER logged
        ❌ NEVER committed
        ❌ NEVER exposed in console
               │
               ▼
    ┌──────────────────────┐
    │ Notification Service │
    ├──────────────────────┤
    │ Validates inputs     │
    │ Sanitizes data       │
    │ Logs safely          │
    └──────────────────────┘
```

## Scaling Capabilities

```
Current Limits:
├── Max donors per notification: 5
├── Max concurrent requests: Unlimited
├── Max notifications per request: 5+ channels × 5 donors = 25 async calls
├── Storage: Last 100 notification logs
├── localStorage size: ~5-10MB typical
└── Response time: <100ms per request

Optimization Points:
├── Async/await for parallel notifications
├── Map/Sort/Filter for quick matching
├── localStorage pagination ready
├── Batch operations supported
└── Queue system ready for Phase 2
```

## Error Handling Flow

```
API Call (SMS/Email/WhatsApp)
    │
    ├─ Success (200)
    │  └─ status = "sent"
    │
    ├─ Service Error (4xx/5xx)
    │  ├─ Logged to localStorage
    │  ├─ status = "failed"
    │  └─ User sees error message
    │
    ├─ Network Error (timeout)
    │  ├─ Logged with timestamp
    │  ├─ status = "failed"
    │  └─ Retry available
    │
    └─ Config Disabled (demo mode)
       ├─ Logged as "simulated"
       ├─ No API call made
       ├─ status = "simulated"
       └─ Ready for real services
```

## Integration Points

```
External APIs Integration:

Twilio SMS API
├── Endpoint: https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json
├── Auth: Basic auth (SID:Token)
├── Request: POST with From/To/Body
└── Response: Message SID, delivery status

Twilio WhatsApp API
├── Endpoint: Same as SMS (messages endpoint)
├── Auth: Basic auth (SID:Token)
├── Request: POST with From: whatsapp:+1xxx
└── Response: Message SID, delivery status

SendGrid Email API
├── Endpoint: https://api.sendgrid.com/v3/mail/send
├── Auth: Bearer token (API Key)
├── Request: POST with JSON body
└── Response: 202 Accepted (async delivery)

localStorage (Demo/Testing)
├── Persistent across sessions
├── ~5-10MB capacity
├── JSON serializable data
└── Perfect for dev & QA
```

---

This architecture supports reliable, scalable blood donation notifications while maintaining security and user privacy. The system gracefully handles failures and provides excellent visibility into the notification process.
