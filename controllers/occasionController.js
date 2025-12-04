import { Occasion } from "../models/occasion.js";
import { StylerClothes } from "../models/stylerClothes.js";
import { Styler } from "../models/styler.js";

/**
 * Create a new occasion/outfit
 */
export const createOccasion = async (req, res) => {
  try {
    const { title, type, date, location, dressCode, notes, skinTone, clothesList } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!title || !date) {
      return res.status(400).json({ error: "Title and date are required" });
    }

    const occasion = new Occasion({
      userId,
      title,
      type: type || "other",
      date,
      location,
      dressCode,
      notes,
      skinTone,
      clothesList: clothesList || []
    });

    await occasion.save();
    
    // Populate clothesList before returning
    await occasion.populate('clothesList');

    res.status(201).json({ occasion });
  } catch (error) {
    console.error("Error in createOccasion:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all occasions for the authenticated user
 */
export const getAllOccasions = async (req, res) => {
  try {
    const userId = req.user._id;

    const occasions = await Occasion.find({ userId })
      .populate('clothesList')
      .sort({ date: -1 });

    res.status(200).json({ data: occasions });
  } catch (error) {
    console.error("Error in getAllOccasions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get a single occasion by ID
 */
export const getOccasionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const occasion = await Occasion.findOne({ _id: id, userId })
      .populate('clothesList');

    if (!occasion) {
      return res.status(404).json({ error: "Occasion not found" });
    }

    res.status(200).json({ occasion });
  } catch (error) {
    console.error("Error in getOccasionById:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update an occasion
 */
export const updateOccasion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, type, date, location, dressCode, notes, skinTone, clothesList } = req.body;

    const occasion = await Occasion.findOne({ _id: id, userId });

    if (!occasion) {
      return res.status(404).json({ error: "Occasion not found" });
    }

    // Update fields if provided
    if (title !== undefined) occasion.title = title;
    if (type !== undefined) occasion.type = type;
    if (date !== undefined) occasion.date = date;
    if (location !== undefined) occasion.location = location;
    if (dressCode !== undefined) occasion.dressCode = dressCode;
    if (notes !== undefined) occasion.notes = notes;
    if (skinTone !== undefined) occasion.skinTone = skinTone;
    if (clothesList !== undefined) occasion.clothesList = clothesList;

    await occasion.save();
    await occasion.populate('clothesList');

    res.status(200).json({ occasion });
  } catch (error) {
    console.error("Error in updateOccasion:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete an occasion
 */
export const deleteOccasion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const occasion = await Occasion.findOneAndDelete({ _id: id, userId });

    if (!occasion) {
      return res.status(404).json({ error: "Occasion not found" });
    }

    res.status(200).json({ message: "Occasion deleted successfully" });
  } catch (error) {
    console.error("Error in deleteOccasion:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get dress suggestions for an occasion based on type and user gender
 */
export const getOccasionSuggestions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the occasion
    const occasion = await Occasion.findOne({ _id: id, userId });

    if (!occasion) {
      return res.status(404).json({ error: "Occasion not found" });
    }

    // Get user's gender from Styler model (if available)
    const styler = await Styler.findById(userId);
    const userGender = styler?.gender;

    // Partner imports removed

    // Partner query removed

    // Find matching clothes from user's own wardrobe
    console.log("=== DEBUG: getOccasionSuggestions ===");
    console.log("userId:", userId);
    console.log("occasion.type:", occasion.type);
    
    // Get all clothes for this user to debug
    const allUserClothes = await StylerClothes.find({ ownerId: userId });
    console.log("Total clothes for user:", allUserClothes.length);
    console.log("Clothes occasions:", allUserClothes.map(c => ({ name: c.name, occasion: c.occasion })));
    
    // Determine target occasion type for matching
    let targetOccasion = occasion.type ? occasion.type.trim().toLowerCase() : 'other';
    if (targetOccasion === 'other') {
      targetOccasion = 'casual'; // Fallback for 'other'
    }

    console.log(`Searching for clothes with occasion: "${targetOccasion}"`);
    console.log(`Regex used: ${targetOccasion} (case-insensitive, partial match)`);

    const query = {
      ownerId: userId,
      occasion: { $regex: new RegExp(targetOccasion, 'i') }
    };
    console.log("Query:", JSON.stringify(query, null, 2));

    const stylerSuggestions = await StylerClothes.find(query).sort({ createdAt: -1 });
    
    console.log(`Found ${stylerSuggestions.length} matches.`);
    if (stylerSuggestions.length > 0) {
      console.log("First match:", stylerSuggestions[0].name, "| Occasion:", stylerSuggestions[0].occasion);
    } else {
      // Debug: Check if ANY clothes exist for this user with this occasion (exact match)
      const exactMatches = await StylerClothes.countDocuments({ ownerId: userId, occasion: targetOccasion });
      console.log(`Exact matches check: ${exactMatches}`);
      
      // Debug: List all occasions for this user to see what's there
      const allOccasions = await StylerClothes.distinct('occasion', { ownerId: userId });
      console.log("Available occasions in wardrobe:", allOccasions);
    }
    
    console.log("Found styler suggestions:", stylerSuggestions.length);

    // Partner details fetching removed

    // Format Styler suggestions
    const formattedStylerSuggestions = stylerSuggestions.map(cloth => ({
      _id: cloth._id,
      name: cloth.name,
      category: cloth.category,
      color: cloth.color,
      image: cloth.image,
      gender: cloth.gender,
      price: cloth.price,
      brand: "My Wardrobe", // Indicating it's from user's wardrobe
      matchReason: `From your wardrobe for ${occasion.type}`,
      partner: null // No partner details for own clothes
    }));

    // Partner suggestions formatting removed

    // Combine suggestions (only styler suggestions now)
    const formattedSuggestions = formattedStylerSuggestions;
    
    console.log("=== DEBUG: Final Response ===");
    console.log("Styler suggestions count:", formattedStylerSuggestions.length);

    res.status(200).json({ 
      suggestions: formattedSuggestions,
      occasion: {
        title: occasion.title,
        type: occasion.type,
        date: occasion.date
      },
      userGender: userGender || 'not set'
    });
  } catch (error) {
    console.error("Error in getOccasionSuggestions:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};
