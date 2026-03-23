import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Public routes working");
});

export default router;
