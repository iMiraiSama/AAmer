import express from "express";
import { createProvider, getProviders } from "../controllers/providerController.js";

const router = express.Router();

router.post("/", createProvider);
router.get("/", getProviders);

export default router;
