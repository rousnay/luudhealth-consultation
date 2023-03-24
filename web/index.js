// //@ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import mongoose from "mongoose";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import serveStatic from "serve-static";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

import verifyProxy from "./middleware/verifyProxy.js";
import proxyRouter from "./routes/app_proxy/index.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/your-database-name";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Start Define TIP API Env
const TIP_HOST = process.env.TIP_HOST;
const TIP_API_VERSION = process.env.TIP_API_VERSION;
const TIP_CLIENT_ID = process.env.TIP_CLIENT_ID;
const TIP_TOKEN = process.env.TIP_TOKEN;
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

//API PROXY Route
app.use("/proxy_route", verifyProxy, proxyRouter);

//Consultations: Generate Configuration
app.post("/proxy_route/consultancy/generate", async (req, res) => {
  const payload = req.body;
  const response = await fetch(
    `${TIP_HOST}/${TIP_API_VERSION}/partners/consultations/generate`,
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

//Consultations: Generate Configuration
app.post("/proxy_route/consultancy", async (req, res) => {
  const payload = req.body;
  const response = await fetch(
    `${TIP_HOST}/${TIP_API_VERSION}/partners/consultations`,
    {
      method: "post",
      headers: tip_header,
      body: JSON.stringify(payload),
    }
  ).then((response) => response.json());
  console.log(payload);
  console.log(MONGODB_URI);
  res.json(response);
  res.status(200).end();
});

app.post("/proxy_route/check", async (req, res) => {
  const payload = req.body;
  console.log(payload);
  console.log("proxy_route/check");
  res.status(200).end();
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
    `${TIP_HOST}/${TIP_API_VERSION}/partners/consultations/generate`,
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

// Shopify APIs
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

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

console.log(PORT);
app.listen(PORT);
