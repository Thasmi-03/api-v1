import { User } from "../models/user.js";
import mongoose from "mongoose";

/**
 * Get paginated list of users (admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.email) filter.email = { $regex: req.query.email, $options: "i" };
    if (req.query.role) filter.role = req.query.role;

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user by ID (admin or specific route protection)
 */
export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid ID format" });

    const user = await User.findById(id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get profile for the logged-in user (requires verifyToken middleware)
 * - verifyToken must set req.user (e.g., req.user.id or req.user._id)
 */
export const getMyProfile = async (req, res) => {
  try {
    // support both shapes: req.user.id or req.user._id
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid ID format" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update logged-in user's profile
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Prevent updating sensitive fields
    const { password, role, isApproved, _id, ...updateData } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new user (admin)
 */
export const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    const userResponse = savedUser.toJSON();
    delete userResponse.password;
    res.status(201).json({ message: "User created", user: userResponse });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => {
        const message = e.message;
        if (message.includes("is required")) {
          return message.replace(/Path `(.+)` is required\./, "$1 is required");
        }
        return message;
      });
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user by ID (admin)
 */
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid ID format" });

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => {
        const message = e.message;
        if (message.includes("is required")) {
          return message.replace(/Path `(.+)` is required\./, "$1 is required");
        }
        return message;
      });
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete user by ID (admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid ID format" });

    const deletedUser = await User.findByIdAndDelete(id).select("-password");

    if (!deletedUser) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ message: "User deleted", user: deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle favorite status of a partner cloth
 */
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { clothId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(clothId))
      return res.status(400).json({ error: "Invalid Cloth ID" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.favorites.indexOf(clothId);
    let isFavorite = false;

    if (index === -1) {
      user.favorites.push(clothId);
      isFavorite = true;
    } else {
      user.favorites.splice(index, 1);
      isFavorite = false;
    }

    await user.save();
    res.status(200).json({ message: "Favorites updated", isFavorite, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user favorites with details
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId).populate("favorites");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
