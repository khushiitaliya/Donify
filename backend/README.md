# Donify Backend API

Backend API for the Donify blood donation web application.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: Donors, Hospitals, and Admin roles
- **Blood Requests**: Create, manage, and track blood donation requests
- **Donation Tracking**: Complete donation lifecycle management
- **Real-time Notifications**: Email and SMS notifications
- **Analytics**: Comprehensive analytics and reporting
- **Security**: Rate limiting, input validation, and security headers

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Twilio** - SMS service

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/donify
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   FRONTEND_URL=http://localhost:3000
   ```

## Database Setup

1. Install MongoDB on your system
2. Start MongoDB service
3. Seed the database with sample data:
   ```bash
   npm run seed
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - Logout

### Donor Routes
- `GET /api/donors/dashboard` - Get donor dashboard
- `PUT /api/donors/availability` - Update availability
- `GET /api/donors/donations` - Get donation history
- `GET /api/donors/requests` - Get available requests
- `POST /api/donors/requests/:requestId/accept` - Accept blood request
- `GET /api/donors/stats` - Get donor statistics

### Hospital Routes
- `GET /api/hospitals/dashboard` - Get hospital dashboard
- `POST /api/hospitals/requests` - Create blood request
- `GET /api/hospitals/requests` - Get hospital requests
- `GET /api/hospitals/requests/:requestId/donors` - Get matching donors
- `PUT /api/hospitals/requests/:requestId/status` - Update request status
- `GET /api/hospitals/donations` - Get hospital donations
- `PUT /api/hospitals/donations/:donationId/complete` - Complete donation
- `GET /api/hospitals/stats` - Get hospital statistics

### Admin Routes
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/status` - Update user status
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/requests` - Get all requests
- `GET /api/admin/donations` - Get all donations
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/audit` - Get audit logs

### Public Routes
- `GET /api/requests` - Get public blood requests
- `GET /api/requests/:requestId` - Get request details
- `GET /api/requests/stats/overview` - Get public statistics
- `POST /api/requests/search` - Search blood requests

## Data Models

### User
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // 'donor', 'hospital', 'admin'
  phone: String,
  location: String,
  bloodGroup: String,
  lastDonationDate: Date,
  isAvailable: Boolean,
  totalDonations: Number,
  points: Number,
  badges: [String],
  isVerified: Boolean
}
```

### BloodRequest
```javascript
{
  hospital: ObjectId,
  bloodGroup: String,
  quantity: Number,
  urgency: String,
  location: String,
  patientName: String,
  patientAge: Number,
  patientGender: String,
  reason: String,
  status: String,
  urgencyScore: Number,
  matchedDonors: [Object]
}
```

### Donation
```javascript
{
  donor: ObjectId,
  hospital: ObjectId,
  bloodRequest: ObjectId,
  bloodGroup: String,
  quantity: Number,
  status: String,
  healthCheck: Object,
  blockchainHash: String
}
```

## Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Role-based access control

## Testing

```bash
npm test
```

## Deployment

1. Set production environment variables
2. Build the application
3. Deploy to your preferred hosting platform
4. Configure MongoDB connection
5. Set up email and SMS services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
