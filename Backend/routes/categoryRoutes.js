const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
} = require("../controllers/categoryController");

router.get("/", auth(), getCategories);
router.post("/", auth(["admin", "manager"]), addCategory);
router.put("/reorder", auth(["admin", "manager"]), reorderCategories);
router.put("/:id", auth(["admin", "manager"]), updateCategory);
router.delete("/:id", auth(["admin", "manager"]), deleteCategory);

module.exports = router;
