const express = require("express");
const UserController = require("../controllers/UserController");
const { authentication, isAdmin } = require("../middlewares/authentication");
const router = express.Router();

router.post("/create", UserController.create);
router.get("/", UserController.getAll);
router.delete("/id/:id", authentication, isAdmin, UserController.delete);
router.put("/id/:id", UserController.update);
router.post("/login", UserController.login);
router.delete("/logout", authentication, UserController.logout);
router.get('/confirm/:email',UserController.confirm)

module.exports = router;
