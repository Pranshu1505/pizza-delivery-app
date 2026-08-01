const Inventory = require("../models/Inventory");
const Order = require("../models/Order");

// @route GET /api/admin/inventory
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({}).sort({ category: 1, name: 1 });
    res.json({ inventory });
  } catch (err) {
    res.status(500).json({ message: "Failed to load inventory", error: err.message });
  }
};

// @route PUT /api/admin/inventory/:id
// Manual stock update capability for each inventory item.
const updateInventoryItem = async (req, res) => {
  try {
    const { stock, lowStockThreshold } = req.body;
    const update = {};
    if (stock !== undefined) update.stock = Math.max(0, Number(stock));
    if (lowStockThreshold !== undefined) update.lowStockThreshold = Number(lowStockThreshold);

    const item = await Inventory.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    res.json({ item });
  } catch (err) {
    res.status(500).json({ message: "Failed to update inventory", error: err.message });
  }
};

// @route GET /api/admin/orders
// View all incoming orders (paid orders only, most recent first).
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "payment.status": "paid" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders", error: err.message });
  }
};

// @route PUT /api/admin/orders/:id/status
const VALID_STATUSES = ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered", "Cancelled"];
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};

module.exports = { getInventory, updateInventoryItem, getAllOrders, updateOrderStatus };