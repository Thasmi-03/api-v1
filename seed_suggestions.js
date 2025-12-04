import mongoose from 'mongoose';
import { PartnerCloth } from './models/partnerClothes.js';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitflow';
    await mongoose.connect(uri);
    console.log('Connected to DB');

    // Create a dummy partner ID if needed, or use a random one
    const partnerId = new mongoose.Types.ObjectId();

    const clothes = [
      {
        name: "Wedding Guest Dress",
        color: "Pink",
        category: "Dress",
        price: 150,
        ownerType: "partner",
        ownerId: partnerId,
        visibility: "public",
        occasion: "wedding",
        gender: "female",
        suitableSkinTones: ["fair", "light"],
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
        brand: "Zara"
      },
      {
        name: "Formal Suit",
        color: "Black",
        category: "Suit",
        price: 300,
        ownerType: "partner",
        ownerId: partnerId,
        visibility: "public",
        occasion: "wedding",
        gender: "male",
        suitableSkinTones: [],
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500",
        brand: "Hugo Boss"
      },
      {
        name: "Beach Party Shirt",
        color: "Blue",
        category: "Shirt",
        price: 45,
        ownerType: "partner",
        ownerId: partnerId,
        visibility: "public",
        occasion: "beach",
        gender: "male",
        suitableSkinTones: ["tan", "dark"],
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
        brand: "H&M"
      },
      {
        name: "Summer Floral Dress",
        color: "Yellow",
        category: "Dress",
        price: 80,
        ownerType: "partner",
        ownerId: partnerId,
        visibility: "public",
        occasion: "casual",
        gender: "female",
        suitableSkinTones: ["medium", "deep"],
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500",
        brand: "Forever 21"
      }
    ];

    await PartnerCloth.insertMany(clothes);
    console.log(`Seeded ${clothes.length} items`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
