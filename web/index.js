// //@ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import serveStatic from "serve-static";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

import verifyProxy from "./middleware/verifyProxy.js";
import proxyRouter from "./routes/app_proxy/index.js";

// import { createVerifyAppProxyMiddleware } from "shopify-verify-app-proxy-middleware";
// import { verifyAppProxyHmac } from "shopify-application-proxy-verification";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

// Start Define TIP API Env

const TIP_CLIENT_ID = process.env.TIP_CLIENT_ID;
const TIP_TOKEN = process.env.TIP_TOKEN;
const TIP_HOST = process.env.TIP_HOST;
const tip_header = {
  Client: TIP_CLIENT_ID,
  Authorization: "Bearer " + TIP_TOKEN,
  Accept: "application/json",
  "Content-Type": "application/json",
};
// End Define TIP API Env

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// const verifyAppProxyMiddleware =
//   createVerifyAppProxyMiddleware(SHOPIFY_API_SECRET);

// app.get("/route_api", verifyAppProxyMiddleware, async (req, res) => {
//   // this request handler will only be hit if the incoming request is verified
//   console.log("TIP API is live!");
//   res.status(200).end();
// });

// app.get("/route_api/tip", async (req, res) => {
//   console.log("TIP API is live!");
//   res.status(200).end();
// });

// const verifyAppProxyRequest = (req, res, next) => {
//   if (verifyAppProxyHmac(req.query, process.env.SHOPIFY_SECRET)) {
//     // if ((verifyAppProxyHmac(req.query), SHOPIFY_API_SECRET)) {
//     return next();
//   }
//   return res.status(403).json({ errorMessage: "I don\t think so." });
// };

// app.get("/api/reviews", verifyAppProxyRequest, async (req, res) => {
//   // res.json("TIP API is live!");
//   console.log("TIP API is live!");
//   res.status(200).end();
// });

app.use("/proxy_route", verifyProxy, proxyRouter);

app.post("/proxy_route/consultancy", async (req, res) => {
  const payload = req.body;
  const response = await fetch(
    `${TIP_HOST}/v1/partners/consultations/generate`,
    {
      method: "post",
      headers: tip_header,
      body: JSON.stringify(payload),
    }
  ).then((response) => response.json());
  console.log(payload);
  console.log("payload");
  res.json(response);
  res.status(200).end();
});

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

// Start TIP API Backend

app.get("/api/tip", async (req, res) => {
  res.write("TIP API is live!");
  console.log("TIP API is live!");
  res.status(200).end();
});

app.post("/api/tip/consultancy", async (req, res) => {
  const payload = req.body;
  const response = await fetch(
    `${TIP_HOST}/v1/partners/consultations/generate`,
    {
      method: "post",
      headers: tip_header,
      body: JSON.stringify(payload),
    }
  ).then((response) => response.json());
  console.log(payload);
  console.log("payload");
  res.json(response);
  res.status(200).end();
});

// End TIP API Backend
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

console.log(PORT);
app.listen(PORT);
