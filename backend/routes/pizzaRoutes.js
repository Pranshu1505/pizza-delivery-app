const express = require("express");
const router = express.Router();
const { getOptions } = require("../controllers/pizzaController");

router.get("/options", getOptions);

module.exports = router;