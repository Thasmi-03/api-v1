import mongoose from "mongoose";
import { Partner } from "../models/partner.js";

export const getAllPartners = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const requestedLimit = parseInt(req.query.limit, 10) || 10;
    const MAX_LIMIT = 50;
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.name) filter.name = new RegExp(req.query.name, "i");

    const total = await Partner.countDocuments(filter);
    const data = await Partner.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPartnerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPartner = async (req, res) => {
  try {
    const newPartner = new Partner(req.body);
    const saved = await newPartner.save();
    res.status(201).json({ message: "Partner created", partner: saved });
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

export const updatePartner = async (req, res) => {
  try {
    const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json({ message: "Partner updated", partner: updated });
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

export const deletePartner = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const deleted = await Partner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json({ message: "Partner deleted", partner: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
