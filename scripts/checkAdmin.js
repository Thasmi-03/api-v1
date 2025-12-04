/**
 * Script to check admin user in database
 * Run with: node scripts/checkAdmin.js
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB\n");

    const email = "admin@gmail.com";
    const password = "admin@123";

    // Find admin user
    const admin = await User.findOne({ email });

    if (!admin) {
      console.log("Admin user not found!");
      console.log("Run: node scripts/seedAdmin.js to create admin user");
      process.exit(1);
    }

    console.log("✓ Admin user found!");
    console.log("\nUser Details:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  isApproved: ${admin.isApproved}`);
    console.log(`  Created: ${admin.createdAt}`);
    console.log(`  Updated: ${admin.updatedAt}`);

    // Test password
    console.log("\nTesting password...");
    const isPasswordValid = await admin.comparePassword(password);
    
    if (isPasswordValid) {
      console.log("✓ Password is correct!");
    } else {
      console.log(" Password is incorrect!");
      console.log("\nThe password in database doesn't match 'admin@123'");
      console.log("This might happen if:");
      console.log("  1. Password was changed");
      console.log("  2. Password was double-hashed");
      console.log("\nSolution: Run 'node scripts/seedAdmin.js' to reset password");
    }

    // Check approval status
    if (admin.isApproved) {
      console.log("\n✓ User is approved - can log in");
    } else {
      console.log("\n User is NOT approved - cannot log in");
      console.log("Solution: User needs to be approved by an admin");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

checkAdmin();





