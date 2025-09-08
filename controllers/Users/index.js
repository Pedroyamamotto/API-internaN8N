import express from "express";
import usersRoutes from "./Users.js";

const router = express.Router();

// rotas 
router.use("/users", usersRoutes);

export default router;