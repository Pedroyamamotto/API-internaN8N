import express from "express";
import { loginUser } from "../../controllers/Users/Login.js";
import { createUser } from "../../controllers/Users/Create.js";
import { updateUser } from "../../controllers/Users/update.js";
import { updatePassword } from "../../controllers/Users/updatePassword.js";
import { activateUser } from "../../controllers/Users/activateUser.js";

const router = express.Router();

// Route for user login
router.post("/login", loginUser);
router.post("/create", createUser);
router.put("/update", updateUser);
router.put("/password", updatePassword);
router.put("/activate", activateUser);

export default router;