import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.js';
import { Partner } from './models/partner.js';
import { Styler } from './models/styler.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitflow');
    console.log('Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!\n');
      console.log('You need to register a user first.\n');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      
      for (const user of users) {
        console.log('─'.repeat(60));
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Approved: ${user.isApproved ? '✅ YES' : '❌ NO (PENDING)'}`);
        console.log(`Created: ${user.createdAt}`);
        
        // Check role-specific data
        if (user.role === 'partner') {
          const partner = await Partner.findById(user._id);
          if (partner) {
            console.log(`Partner Name: ${partner.name}`);
            console.log(`Partner Email: ${partner.email}`);
            console.log(`Partner Phone: ${partner.phone || 'N/A'}`);
            console.log(`Partner Location: ${partner.location || 'N/A'}`);
          } else {
            console.log('⚠️  Partner record not found!');
          }
        } else if (user.role === 'styler') {
          const styler = await Styler.findById(user._id);
          if (styler) {
            console.log(`Styler Name: ${styler.name}`);
            console.log(`Styler Gender: ${styler.gender || 'N/A'}`);
            console.log(`Styler DOB: ${styler.dateOfBirth || 'N/A'}`);
          } else {
            console.log('⚠️  Styler record not found!');
          }
        }
        
        // Login status
        if (!user.isApproved) {
          console.log('\n🚫 LOGIN STATUS: Cannot log in - waiting for admin approval');
        } else {
          console.log('\n✅ LOGIN STATUS: Can log in');
        }
        console.log('');
      }
      console.log('─'.repeat(60));
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    const approvedCount = users.filter(u => u.isApproved).length;
    const pendingCount = users.filter(u => !u.isApproved).length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const stylerCount = users.filter(u => u.role === 'styler').length;
    const partnerCount = users.filter(u => u.role === 'partner').length;
    
    console.log(`Total Users: ${users.length}`);
    console.log(`Approved: ${approvedCount}`);
    console.log(`Pending: ${pendingCount}`);
    console.log(`Admins: ${adminCount}`);
    console.log(`Stylers: ${stylerCount}`);
    console.log(`Partners: ${partnerCount}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
