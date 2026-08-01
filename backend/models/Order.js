const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    base: { name: String, inventoryKey: String, price: Number },
    sauce: { name: String, inventoryKey: String, price: Number },
    cheese: { name: String, inventoryKey: String, price: Number },
    veggies: [{ name: String, inventoryKey: String, price: Number }],
    quantity: { type: Number, default: 1, min: 1 },
    itemTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered", "Cancelled"],
      default: "Order Received",
    },

    payment: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    },

    deliveryAddress: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);