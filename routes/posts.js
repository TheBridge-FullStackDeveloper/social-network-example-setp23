const express = require("express");
const PostController = require("../controllers/PostController");
const { authentication } = require("../middlewares/authentication");
const router = express.Router();

router.post("/create",authentication, PostController.create);
router.get("/", PostController.getAll);
router.get("/id/:id",PostController.getById)
router.get("/title/:title",PostController.getOneByName)
router.delete("/id/:id",authentication,PostController.delete)

module.exports = router;
