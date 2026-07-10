import { Router, type IRouter } from "express";
import { getLiveCrowdData } from "../lib/crowdData";
import { GetCrowdGatesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/crowd/gates", async (_req, res): Promise<void> => {
  const data = getLiveCrowdData();
  res.json(GetCrowdGatesResponse.parse(data));
});

export default router;
