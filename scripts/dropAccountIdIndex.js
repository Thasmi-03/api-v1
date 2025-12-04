/**
 * Script to manually drop the accountId index from users collection
 * Run with: node scripts/dropAccountIdIndex.js
 */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { dropAccountIdIndex } from "../models/user.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");
    
    await dropAccountIdIndex();
    
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

run();

