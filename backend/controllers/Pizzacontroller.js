const PizzaOption = require("../models/Pizza");
const Inventory = require("../models/Inventory");

// @route GET /api/pizza/options
// Returns all available bases, sauces, cheeses, veggies grouped by type,
// each annotated with live stock availability.
const getOptions = async (req, res) => {
  try {
    const options = await PizzaOption.find({ available: true });
    const keys = options.map((o) => o.inventoryKey);
    const inventory = await Inventory.find({ key: { $in: keys } });
    const stockMap = Object.fromEntries(inventory.map((i) => [i.key, i.stock]));

    const grouped = { base: [], sauce: [], cheese: [], veggie: [] };
    options.forEach((o) => {
      if (!grouped[o.type]) return;
      grouped[o.type].push({
        id: o._id,
        name: o.name,
        price: o.price,
        inventoryKey: o.inventoryKey,
        inStock: (stockMap[o.inventoryKey] ?? 0) > 0,
        stock: stockMap[o.inventoryKey] ?? 0,
      });
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: "Failed to load pizza options", error: err.message });
  }
};

module.exports = { getOptions };