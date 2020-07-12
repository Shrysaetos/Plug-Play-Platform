const express = require("express");

const userController = require("../controllers/UserController");

const router = express.Router();

router.post("/login", userController.loginUser);

router.get("/:username", userController.getUserByUsername);

router.post("/create", userController.createUser);

router.patch("/:username", userController.updatePasswordByUsername);

module.exports = router;
