const express = require("express");
const router = express.Router();
const {
  getInventory,
  updateInventoryItem,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

router.get("/inventory", getInventory);
router.put("/inventory/:id", updateInventoryItem);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;