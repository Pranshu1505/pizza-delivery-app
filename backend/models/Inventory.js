const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "base_thin_crust"
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["base", "sauce", "cheese", "veggie"],
      required: true,
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 20 },
    lastAlertSentAt: { type: Date, default: null }, // avoid spamming admin
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);