import mongoose from "mongoose";
import { PartnerCloth } from "../models/partnerClothes.js";

// Update with your real Mongo URI
const MONGO_URI = "mongodb+srv://username:password@cluster0.mongodb.net/yourdbname?retryWrites=true&w=majority";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Your real user id for GET /mine
    const partner1 = new mongoose.Types.ObjectId("69119d5227ba18d9620f9794");

    await PartnerCloth.insertMany([
      { name: "Blue Summer Dress", color: "Blue", category: "Dress", price: 1200, ownerType: "partner", ownerId: partner1, visibility: "public" },
      { name: "Red Party Gown", color: "Red", category: "Gown", price: 4500, ownerType: "partner", ownerId: partner1, visibility: "public" },
      { name: "Black Jacket", color: "Black", category: "Jacket", price: 2500, ownerType: "partner", ownerId: partner1, visibility: "public" } // ✅ black item
    ]);

    console.log("Partner clothes seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
