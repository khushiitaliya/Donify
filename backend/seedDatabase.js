const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const BloodRequest = require('./models/BloodRequest');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/donify');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await BloodRequest.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@donify.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true
    });
    await admin.save();
    console.log('Created admin user');

    // Create sample donors
    const donorData = [
      {
        name: 'John Smith',
        email: 'john@donor.com',
        password: await bcrypt.hash('donor123', 10),
        role: 'donor',
        bloodGroup: 'O+',
        location: 'New York, NY',
        phone: '+1234567890',
        isAvailable: true,
        totalDonations: 5,
        points: 50,
        badges: ['Bronze', 'Silver'],
        lastDonationDate: new Date('2023-01-15'),
        isVerified: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@donor.com',
        password: await bcrypt.hash('donor123', 10),
        role: 'donor',
        bloodGroup: 'A+',
        location: 'Los Angeles, CA',
        phone: '+1234567891',
        isAvailable: true,
        totalDonations: 3,
        points: 30,
        badges: ['Bronze'],
        lastDonationDate: new Date('2023-02-20'),
        isVerified: true
      },
      {
        name: 'Michael Brown',
        email: 'michael@donor.com',
        password: await bcrypt.hash('donor123', 10),
        role: 'donor',
        bloodGroup: 'B+',
        location: 'Chicago, IL',
        phone: '+1234567892',
        isAvailable: false,
        totalDonations: 12,
        points: 120,
        badges: ['Bronze', 'Silver', 'Gold'],
        lastDonationDate: new Date('2023-03-10'),
        isVerified: true
      },
      {
        name: 'Emily Davis',
        email: 'emily@donor.com',
        password: await bcrypt.hash('donor123', 10),
        role: 'donor',
        bloodGroup: 'AB-',
        location: 'Houston, TX',
        phone: '+1234567893',
        isAvailable: true,
        totalDonations: 8,
        points: 80,
        badges: ['Bronze', 'Silver'],
        lastDonationDate: new Date('2023-01-05'),
        isVerified: true
      },
      {
        name: 'David Wilson',
        email: 'david@donor.com',
        password: await bcrypt.hash('donor123', 10),
        role: 'donor',
        bloodGroup: 'O-',
        location: 'Phoenix, AZ',
        phone: '+1234567894',
        isAvailable: true,
        totalDonations: 15,
        points: 150,
        badges: ['Bronze', 'Silver', 'Gold', 'Life Saver'],
        lastDonationDate: new Date('2023-04-01'),
        isVerified: true
      }
    ];

    const createdDonors = await User.insertMany(donorData);
    console.log(`Created ${createdDonors.length} donors`);

    // Create sample hospitals
    const hospitalData = [
      {
        name: 'City General Hospital',
        email: 'city@hospital.com',
        password: await bcrypt.hash('hospital123', 10),
        role: 'hospital',
        phone: '+1234567895',
        location: 'New York, NY',
        isVerified: true
      },
      {
        name: 'St. Mary Medical Center',
        email: 'stmary@hospital.com',
        password: await bcrypt.hash('hospital123', 10),
        role: 'hospital',
        phone: '+1234567896',
        location: 'Los Angeles, CA',
        isVerified: true
      },
      {
        name: 'Memorial Hospital',
        email: 'memorial@hospital.com',
        password: await bcrypt.hash('hospital123', 10),
        role: 'hospital',
        phone: '+1234567897',
        location: 'Chicago, IL',
        isVerified: true
      }
    ];

    const createdHospitals = await User.insertMany(hospitalData);
    console.log(`Created ${createdHospitals.length} hospitals`);

    // Create sample blood requests
    const requestData = [
      {
        hospital: createdHospitals[0]._id,
        hospitalName: 'City General Hospital',
        bloodGroup: 'O+',
        quantity: 2,
        urgency: 'critical',
        location: 'New York, NY',
        patientName: 'John Patient',
        patientAge: 45,
        patientGender: 'male',
        contactPerson: 'Dr. Smith',
        contactPhone: '+1234567898',
        reason: 'Emergency surgery - internal bleeding',
        status: 'pending'
      },
      {
        hospital: createdHospitals[1]._id,
        hospitalName: 'St. Mary Medical Center',
        bloodGroup: 'A+',
        quantity: 1,
        urgency: 'high',
        location: 'Los Angeles, CA',
        patientName: 'Jane Patient',
        patientAge: 32,
        patientGender: 'female',
        contactPerson: 'Dr. Johnson',
        contactPhone: '+1234567899',
        reason: 'Cancer treatment - chemotherapy',
        status: 'pending'
      },
      {
        hospital: createdHospitals[2]._id,
        hospitalName: 'Memorial Hospital',
        bloodGroup: 'B+',
        quantity: 3,
        urgency: 'medium',
        location: 'Chicago, IL',
        patientName: 'Bob Patient',
        patientAge: 67,
        patientGender: 'male',
        contactPerson: 'Dr. Brown',
        contactPhone: '+1234567900',
        reason: 'Heart surgery - bypass operation',
        status: 'accepted',
        acceptedBy: createdDonors[2]._id,
        acceptedAt: new Date()
      },
      {
        hospital: createdHospitals[0]._id,
        hospitalName: 'City General Hospital',
        bloodGroup: 'AB-',
        quantity: 1,
        urgency: 'high',
        location: 'New York, NY',
        patientName: 'Alice Patient',
        patientAge: 28,
        patientGender: 'female',
        contactPerson: 'Dr. Davis',
        contactPhone: '+1234567901',
        reason: 'Trauma - car accident',
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000)
      },
      {
        hospital: createdHospitals[1]._id,
        hospitalName: 'St. Mary Medical Center',
        bloodGroup: 'O-',
        quantity: 2,
        urgency: 'critical',
        location: 'Los Angeles, CA',
        patientName: 'Charlie Patient',
        patientAge: 55,
        patientGender: 'male',
        contactPerson: 'Dr. Wilson',
        contactPhone: '+1234567902',
        reason: 'Liver transplant surgery',
        status: 'pending'
      }
    ];

    // Calculate urgency scores and save requests
    for (const requestDataItem of requestData) {
      const bloodRequest = new BloodRequest(requestDataItem);
      bloodRequest.calculateUrgencyScore();
      await bloodRequest.save();
    }

    console.log(`Created ${requestData.length} blood requests`);
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('👤 Admin: admin@donify.com / admin123');
    console.log('🩸 Donor 1: john@donor.com / donor123');
    console.log('🩸 Donor 2: sarah@donor.com / donor123');
    console.log('🏥 Hospital 1: city@hospital.com / hospital123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
