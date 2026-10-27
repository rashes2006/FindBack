const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');
const AuditLog = require('./models/AuditLog');
const Notification = require('./models/Notification');
const Payment = require('./models/Payment');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    await Payment.deleteMany({});

    console.log('Creating demo users...');
    const finder = await User.create({
      name: 'Aarav Sharma',
      email: 'finder@campus.edu',
      password: 'password123',
      role: 'student',
      studentOrStaffId: 'CS2026-089',
      department: 'Computer Science & Engineering',
      phone: '+91 98765 43210'
    });

    const student = await User.create({
      name: 'Priya Patel',
      email: 'student@campus.edu',
      password: 'password123',
      role: 'student',
      studentOrStaffId: 'EC2026-142',
      department: 'Electronics & Communication',
      phone: '+91 91234 56789'
    });

    const admin = await User.create({
      name: 'Officer Rajesh Kumar',
      email: 'admin@campus.edu',
      password: 'password123',
      role: 'admin',
      studentOrStaffId: 'SEC-HQ-007',
      department: 'Campus Security & Desk Operations',
      phone: '+91 99887 76655'
    });

    console.log('Seeding campus items and anti-fraud clues...');

    // Item 1: AirPods Pro - Approved for handover with active OTP: 749216
    const airpods = await Item.create({
      type: 'found',
      title: 'Apple AirPods Pro (2nd Gen) in White Case',
      category: 'Electronics',
      description: 'Found on the reading desk near the periodicals section. Case has a small protective silicone ring.',
      location: {
        campusZone: 'Central Library',
        specificSpot: '2nd Floor Reading Hall, Desk 18'
      },
      dateOccurred: new Date(Date.now() - 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      status: 'approved_for_handover',
      reportedBy: finder._id,
      verificationClues: [
        {
          question: 'What is engraved on the front of the charging case?',
          expectedAnswerHint: 'Small rocket emoji or initials PP'
        },
        {
          question: 'What color is the inner lanyard loop?',
          expectedAnswerHint: 'Grey woven loop'
        }
      ],
      claimedBy: student._id
    });

    const airpodsClaim = await Claim.create({
      item: airpods._id,
      claimant: student._id,
      answers: [
        {
          question: 'What is engraved on the front of the charging case?',
          answer: 'It has my initials PP engraved from Apple store'
        },
        {
          question: 'What color is the inner lanyard loop?',
          answer: 'Grey braided cord'
        }
      ],
      proofDescription: 'I can connect to it via my iPhone Bluetooth name "Priya\'s AirPods Pro". I was studying at desk 18 yesterday afternoon.',
      status: 'approved',
      reviewNotes: 'Bluetooth name and engraving match verified student ID.',
      reviewedBy: admin._id,
      reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      handoverOtp: '749216',
      handoverOtpExpiresAt: new Date(Date.now() + 46 * 60 * 60 * 1000)
    });

    airpods.currentClaim = airpodsClaim._id;
    await airpods.save();

    // Item 2: Casio Calculator - Claim Pending review
    const calc = await Item.create({
      type: 'found',
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category: 'Electronics',
      description: 'Black scientific calculator left behind on a bench after the Mathematics end-term exam.',
      location: {
        campusZone: 'Academic Block A',
        specificSpot: 'Hall 302, Row 4'
      },
      dateOccurred: new Date(Date.now() - 12 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      status: 'claim_pending',
      reportedBy: finder._id,
      verificationClues: [
        {
          question: 'What sticker or handwritten mark is inside the sliding cover?',
          expectedAnswerHint: 'Blue sticker saying "Matrix"'
        }
      ]
    });

    await Claim.create({
      item: calc._id,
      claimant: student._id,
      answers: [
        {
          question: 'What sticker or handwritten mark is inside the sliding cover?',
          answer: 'There is a small blue sticker with "Matrix" on the inside cover.'
        }
      ],
      proofDescription: 'I had the Math-II exam in Hall 302 from 9 AM to 12 PM yesterday. I left it on row 4 seat B.',
      status: 'pending'
    });

    // Item 3: Leather Wallet - Open
    await Item.create({
      type: 'found',
      title: 'Brown Leather Bi-fold Wallet',
      category: 'Keys & Wallets',
      description: 'Found under the corner table during lunch hours. Contains cards and receipts.',
      location: {
        campusZone: 'Main Cafeteria',
        specificSpot: 'Corner booth near juice counter'
      },
      dateOccurred: new Date(Date.now() - 6 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      status: 'open',
      reportedBy: finder._id,
      verificationClues: [
        {
          question: 'What bank card or ID card is visible in the top slot?',
          expectedAnswerHint: 'HDFC Platinum debit card ending in 4021'
        },
        {
          question: 'What brand logo is embossed on the leather exterior?',
          expectedAnswerHint: 'Wildhorn'
        }
      ]
    });

    // Item 4: Hydro Flask - Returned (Successfully handed over with completed audit record)
    await Item.create({
      type: 'found',
      title: 'Hydro Flask 32oz Wide Mouth (Olive Green)',
      category: 'Personal Essentials',
      description: 'Stainless steel insulated water bottle found on the bleachers.',
      location: {
        campusZone: 'Sports Arena',
        specificSpot: 'East Bleachers, Section C'
      },
      dateOccurred: new Date(Date.now() - 72 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      status: 'returned',
      reportedBy: finder._id,
      claimedBy: student._id,
      verificationClues: [
        {
          question: 'What stickers are on the body of the bottle?',
          expectedAnswerHint: 'GitHub Octocat and NASA logo'
        }
      ],
      handoverRecord: {
        handedOverAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        handedOverBy: admin._id,
        receivedBy: student._id,
        notes: 'Owner verified stickers and provided 6-digit OTP 381904 at Central Security Desk'
      }
    });

    // Item 5: Dorm Keys - Open
    await Item.create({
      type: 'found',
      title: 'Brass Dorm Key Ring with Blue Lanyard',
      category: 'Keys & Wallets',
      description: 'Found on the lawn near the entrance pathway.',
      location: {
        campusZone: 'Hostel Block 1',
        specificSpot: 'Main Entrance Pathway'
      },
      dateOccurred: new Date(Date.now() - 3 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      status: 'open',
      reportedBy: admin._id,
      verificationClues: [
        {
          question: 'How many keys are on the ring and what token/shape is attached?',
          expectedAnswerHint: '3 keys with an anime acrylic keychain'
        }
      ]
    });

    // Item 6: MacBook Air - Reported LOST by Student (Shows matching workflow)
    await Item.create({
      type: 'lost',
      title: 'Apple MacBook Air M2 13-inch (Space Gray)',
      category: 'Electronics',
      description: 'Left behind on workstation desk 12 while going for printing. Has a transparent hard shell case.',
      location: {
        campusZone: 'Computer Science Lab',
        specificSpot: 'Lab 4, Workstation 12'
      },
      dateOccurred: new Date(Date.now() - 4 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      status: 'open',
      reportedBy: student._id,
      verificationClues: []
    });

    console.log('Creating initial Audit Logs...');
    await AuditLog.create([
      {
        action: 'ITEM_REPORTED',
        entityType: 'Item',
        entityId: airpods._id,
        performedBy: finder._id,
        details: 'Found item reported: Apple AirPods Pro (2nd Gen)'
      },
      {
        action: 'CLAIM_SUBMITTED',
        entityType: 'Claim',
        entityId: airpodsClaim._id,
        performedBy: student._id,
        details: 'Claim submitted by Priya Patel with Bluetooth proof'
      },
      {
        action: 'HANDOVER_OTP_GENERATED',
        entityType: 'Claim',
        entityId: airpodsClaim._id,
        performedBy: admin._id,
        details: 'Security Officer approved claim and generated 6-digit OTP: 749216'
      },
      {
        action: 'ITEM_RETURNED',
        entityType: 'Item',
        entityId: airpods._id,
        performedBy: admin._id,
        details: 'Hydro Flask 32oz handed over to verified owner with OTP'
      }
    ]);

    console.log('Seeding Razorpay test mode payment transactions...');
    const samplePayment = await Payment.create({
      orderId: 'order_test_campus_seed_001',
      paymentId: 'pay_test_rzp_airpods_reward',
      signature: 'test_sig_campus_seed_airpods',
      amount: 150,
      amountInPaise: 15000,
      currency: 'INR',
      status: 'captured',
      purpose: 'finder_reward',
      item: airpods._id,
      claim: airpodsClaim._id,
      payer: student._id,
      recipient: finder._id,
      notes: 'Thank you so much Aarav for finding and reporting my AirPods!',
      receipt: 'rcpt_seed_001',
      mode: 'test',
      paymentMethod: 'razorpay_test_mode'
    });

    await AuditLog.create({
      action: 'PAYMENT_COMPLETED',
      entityType: 'Payment',
      entityId: samplePayment._id,
      performedBy: student._id,
      details: 'Paid ₹150 finder reward to Aarav Sharma via Razorpay Test Mode [ID: pay_test_rzp_airpods_reward]',
      metadata: {
        orderId: samplePayment.orderId,
        paymentId: samplePayment.paymentId,
        amount: 150,
        mode: 'test'
      }
    });

    console.log('Creating demo notifications...');
    await Notification.create([
      {
        recipient: student._id,
        title: 'Claim Approved! Handover Token Issued',
        message: 'Your claim for Apple AirPods Pro was approved! Handover OTP: 749216. Pick up at Central Security Desk.',
        type: 'handover_ready',
        link: '/my-claims',
        isRead: false
      },
      {
        recipient: finder._id,
        title: 'New Claim Received',
        message: 'Priya Patel submitted a claim with answers for Casio fx-991EX Calculator.',
        type: 'claim_received',
        link: `/items/${calc._id}`,
        isRead: false
      },
      {
        recipient: finder._id,
        title: '🎉 Finder Gratitude Reward Received!',
        message: 'Priya Patel sent you a ₹150 reward for finding "Apple AirPods Pro" via Razorpay (Test Mode).',
        type: 'reward_received',
        link: `/items/${airpods._id}`,
        isRead: false
      }
    ]);

    console.log('\n======================================================');
    console.log('✅ FindBack Database Seeded Successfully!');
    console.log('======================================================');
    console.log('Test Accounts:');
    console.log('  1. Student Claimant : student@campus.edu  / password123');
    console.log('  2. Student Finder   : finder@campus.edu   / password123');
    console.log('  3. Campus Admin/Desk: admin@campus.edu    / password123');
    console.log('\nReady-to-Test Handover OTP:');
    console.log('  Code: 749216 (for AirPods Pro waiting at Security Desk)');
    console.log('======================================================\n');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seed error:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
