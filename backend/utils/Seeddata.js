// Run with: npm run seed
// Populates PizzaOption + Inventory collections with the 5 bases, 5 sauces,
// cheese types, and veggie options, plus an initial admin user.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const PizzaOption = require("../models/Pizza");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

const bases = [
  { name: "Thin Crust", price: 150, key: "base_thin_crust" },
  { name: "Classic Hand Tossed", price: 180, key: "base_hand_tossed" },
  { name: "Cheese Burst", price: 220, key: "base_cheese_burst" },
  { name: "Whole Wheat", price: 170, key: "base_whole_wheat" },
  { name: "Gluten Free", price: 210, key: "base_gluten_free" },
];

const sauces = [
  { name: "Classic Tomato", price: 20, key: "sauce_tomato" },
  { name: "Peri Peri", price: 25, key: "sauce_peri_peri" },
  { name: "BBQ", price: 30, key: "sauce_bbq" },
  { name: "Pesto", price: 35, key: "sauce_pesto" },
  { name: "Alfredo White Sauce", price: 30, key: "sauce_alfredo" },
];

const cheeses = [
  { name: "Mozzarella", price: 40, key: "cheese_mozzarella" },
  { name: "Cheddar", price: 40, key: "cheese_cheddar" },
  { name: "Vegan Cheese", price: 50, key: "cheese_vegan" },
];

const veggies = [
  { name: "Onion", price: 10, key: "veg_onion" },
  { name: "Capsicum", price: 10, key: "veg_capsicum" },
  { name: "Mushroom", price: 15, key: "veg_mushroom" },
  { name: "Tomato", price: 10, key: "veg_tomato" },
  { name: "Sweet Corn", price: 15, key: "veg_corn" },
  { name: "Jalapeno", price: 15, key: "veg_jalapeno" },
  { name: "Black Olives", price: 20, key: "veg_olives" },
  { name: "Paneer", price: 30, key: "veg_paneer" },
];

const seed = async () => {
  await connectDB();

  await PizzaOption.deleteMany({});
  await Inventory.deleteMany({});

  const inventoryDocs = [];
  const optionDocs = [];

  const register = (list, type, category) => {
    list.forEach((item) => {
      optionDocs.push({
        name: item.name,
        type,
        price: item.price,
        inventoryKey: item.key,
      });
      inventoryDocs.push({
        key: item.key,
        name: item.name,
        category,
        stock: 100, // starting stock
        lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD) || 20,
      });
    });
  };

  register(bases, "base", "base");
  register(sauces, "sauce", "sauce");
  register(cheeses, "cheese", "cheese");
  register(veggies, "veggie", "veggie");

  await PizzaOption.insertMany(optionDocs);
  await Inventory.insertMany(inventoryDocs);

  console.log(`Seeded ${optionDocs.length} pizza options and ${inventoryDocs.length} inventory items.`);

  // Create a default admin if none exists
  const existingAdmin = await User.findOne({ role: "admin" });
  if (!existingAdmin) {
    await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL || "admin@pizzapalace.com",
      password: "Admin@123", // change after first login
      role: "admin",
      isVerified: true,
    });
    console.log(`Default admin created: ${process.env.ADMIN_EMAIL || "admin@pizzapalace.com"} / Admin@123`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});