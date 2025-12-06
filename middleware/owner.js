import { User } from "../models/user.js";

/**
 * Middleware to ensure only the owner of the resource can access it.
 * This is stricter than admin access - even admins cannot bypass this
 * unless they are the owner.
 */
export const verifyOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const resourceId = req.params.id;
    const userId = req.user._id.toString();

    // Check if the logged-in user is the owner of the resource
    if (userId !== resourceId) {
      return res.status(403).json({ 
        error: "Access denied. You can only access your own data." 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Authorization check failed" });
  }
};
