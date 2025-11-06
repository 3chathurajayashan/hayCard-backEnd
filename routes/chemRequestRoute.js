const express = require("express");
const { addChemical, getChemicals } = require("../controllers/chemRequestController");

const router = express.Router();

router.post("/add", addChemical);
router.get("/all", getChemicals);

module.exports = router;
