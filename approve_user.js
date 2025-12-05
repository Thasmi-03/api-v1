import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.js';

dotenv.config();

const approveUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitflow');
    console.log('Connected to MongoDB\n');

    if (!email) {
      console.log('Usage: node approve_user.js <email>');
      console.log('Example: node approve_user.js partner@example.com\n');
      process.exit(1);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found!\n`);
      process.exit(1);
    }

    if (user.isApproved) {
      console.log(`✅ User "${email}" is already approved!\n`);
      process.exit(0);
    }

    user.isApproved = true;
    await user.save();

    console.log(`✅ Successfully approved user: ${email}`);
    console.log(`Role: ${user.role}`);
    console.log(`\nUser can now log in!\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const email = process.argv[2];
approveUser(email);
