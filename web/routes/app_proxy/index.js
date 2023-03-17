import { Router } from "express";
const proxyRouter = Router();

proxyRouter.get("/test", (req, res) => {
  const jsonObject = { content: "proxy be working" };
  // res.send(jsonObject);
  res.write("jsonObject");
  console.log("TIP API is live!");
});

export default proxyRouter;
