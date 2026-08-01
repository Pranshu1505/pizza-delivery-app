const Order = require("../models/Order");
const PizzaOption = require("../models/Pizza");
const Inventory = require("../models/Inventory");

// Recomputes prices server-side from the DB so the client can't tamper with totals.
const priceLookup = async () => {
  const options = await PizzaOption.find({});
  const map = {};
  options.forEach((o) => (map[o.inventoryKey] = o.price));
  return map;
};

const computeItemTotal = (item, prices) => {
  let total = prices[item.base.inventoryKey] || 0;
  total += prices[item.sauce.inventoryKey] || 0;
  total += prices[item.cheese.inventoryKey] || 0;
  (item.veggies || []).forEach((v) => (total += prices[v.inventoryKey] || 0));
  return total * (item.quantity || 1);
};

// @route POST /api/orders
// Creates an order in "pending" payment state. Stock is NOT decremented yet -
// it's decremented only after payment is verified, so abandoned carts don't
// falsely reduce inventory.
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, notes } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: "Order must contain at least one pizza" });
    }

    const prices = await priceLookup();

    // Validate every referenced inventory key exists and has stock for qty 1+
    const allKeys = new Set();
    items.forEach((item) => {
      allKeys.add(item.base.inventoryKey);
      allKeys.add(item.sauce.inventoryKey);
      allKeys.add(item.cheese.inventoryKey);
      (item.veggies || []).forEach((v) => allKeys.add(v.inventoryKey));
    });
    const inventoryDocs = await Inventory.find({ key: { $in: [...allKeys] } });
    const stockMap = Object.fromEntries(inventoryDocs.map((i) => [i.key, i.stock]));
    for (const key of allKeys) {
      if ((stockMap[key] ?? 0) <= 0) {
        return res.status(409).json({ message: `Sorry, an ingredient is currently out of stock.` });
      }
    }

    const preparedItems = items.map((item) => ({
      base: { ...item.base, price: prices[item.base.inventoryKey] || 0 },
      sauce: { ...item.sauce, price: prices[item.sauce.inventoryKey] || 0 },
      cheese: { ...item.cheese, price: prices[item.cheese.inventoryKey] || 0 },
      veggies: (item.veggies || []).map((v) => ({ ...v, price: prices[v.inventoryKey] || 0 })),
      quantity: item.quantity || 1,
      itemTotal: computeItemTotal(item, prices),
    }));

    const totalAmount = preparedItems.reduce((sum, i) => sum + i.itemTotal, 0);

    const order = await Order.create({
      user: req.user._id,
      items: preparedItems,
      totalAmount,
      deliveryAddress: deliveryAddress || "",
      notes: notes || "",
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// @route GET /api/orders/mine
// Used by the user dashboard to poll order status for real-time tracking.
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders", error: err.message });
  }
};

// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to load order", error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };