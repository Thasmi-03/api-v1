import express from "express";
import { Partner } from "../models/partner.js";

const router = express.Router();

// GET all partners (public)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.name) filter.name = new RegExp(req.query.name, "i");

    const total = await Partner.countDocuments(filter);
    const data = await Partner.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single partner (public)
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ error: "Invalid ID format" });

    const partner = await Partner.findById(id);
    if (!partner) return res.status(404).json({ error: "Partner not found." });

    res.json(partner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
