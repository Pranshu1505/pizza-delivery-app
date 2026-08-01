const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

// Lazily create the Razorpay client so a missing/blank API key only breaks
// the payment endpoints (with a clear error) instead of crashing the whole
// server on startup.
let razorpay = null;
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
    );
  }
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// @route POST /api/payments/create-razorpay-order
// Creates a Razorpay order (test mode) for an existing DB order.
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Razorpay expects the amount in the smallest currency unit (paise for INR)
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: `order_${order._id}`,
    });

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      dbOrderId: order._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to initiate payment", error: err.message });
  }
};

// @route POST /api/payments/verify
// Verifies the Razorpay signature (test mode: click "Success" in the checkout modal),
// marks the order paid, and decrements ingredient stock.
const verifyPayment = async (req, res) => {
  try {
    const { dbOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed - signature mismatch" });
    }

    const order = await Order.findById(dbOrderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.status = "paid";
    order.status = "Order Received";
    await order.save();

    // Decrement stock for every ingredient used, per quantity ordered
    const decrementOps = [];
    order.items.forEach((item) => {
      const qty = item.quantity || 1;
      [item.base, item.sauce, item.cheese, ...(item.veggies || [])].forEach((ing) => {
        if (!ing?.inventoryKey) return;
        decrementOps.push({
          updateOne: {
            filter: { key: ing.inventoryKey },
            update: { $inc: { stock: -qty } },
          },
        });
      });
    });
    if (decrementOps.length) await Inventory.bulkWrite(decrementOps);

    // Stock is never allowed to go negative - clamp any that dipped below 0
    await Inventory.updateMany({ stock: { $lt: 0 } }, { $set: { stock: 0 } });

    res.json({ message: "Payment verified successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Payment verification failed", error: err.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };