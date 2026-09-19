const express = require("express");

const wishlistController = require("../controllers/wishlist.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  addWishlistSchema,
  removeWishlistSchema,
} = require("../validators/wishlist.validator");

const router = express.Router();

router.use(protect, authorize("customer"));

router.get("/", wishlistController.getWishlist);

router.post(
  "/",
  validate(addWishlistSchema),
  wishlistController.addToWishlist
);

router.delete(
  "/:serviceId",
  validate(removeWishlistSchema),
  wishlistController.removeFromWishlist
);

module.exports = router;
