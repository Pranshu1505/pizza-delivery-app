const mongoose = require("mongoose");

// Represents a single customizable option (e.g. a base, sauce, cheese, or veggie)
// as well as ready-made "signature" pizza varieties shown on the dashboard.
const pizzaOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["base", "sauce", "cheese", "veggie", "signature"],
      required: true,
    },
    price: { type: Number, required: true, default: 0 },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    // links this option to the matching Inventory item for stock decrement
    inventoryKey: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PizzaOption", pizzaOptionSchema);