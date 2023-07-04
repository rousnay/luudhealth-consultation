// //@ts-check
import dotenv from "dotenv";
dotenv.config();

import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import fetch from "node-fetch";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import webhookHandlers from "./webhook-handlers.js";
import verifyProxy from "./middleware/verifyProxy.js";
import proxyRouter from "./routes/app_proxy/index.js";
import { connectToDB } from "./db.js";
import { consultancySubmit, medicalSubmit } from "./tip-db-form.js";
import { submitConsultancy } from "./tip-consultations.js";
import { placeOrder } from "./tip-order.js";
import { orderFulfilled } from "./tip-fulfilled.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

// Start Define TIP API Env
const TIP_HOST = process.env.TIP_HOST;
const TIP_API_VERSION = process.env.TIP_API_VERSION;
const TIP_CLIENT_ID = process.env.TIP_CLIENT_ID;
const TIP_TOKEN = process.env.TIP_TOKEN;
const SHOP = process.env.SHOP;
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
  shopify.processWebhooks({ webhookHandlers })
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

  console.log("### APP: consultancy/generate:", JSON.stringify(payload));

  res.json(response);
  res.status(200).end();
});

//Form: Consultations data into DB
app.post("/proxy_route/consultancy/submit", async (req, res) => {
  const payload = req.body;
  consultancySubmit(payload);

  console.log("### APP: consultancy/submit:", JSON.stringify(payload));

  res.json(payload);
  res.status(200).end();
});

//Form: Medical data into DB
app.post("/proxy_route/medical/submit", async (req, res) => {
  const payload = req.body;
  medicalSubmit(payload);

  console.log("### APP: medical/submit Body:", JSON.stringify(payload));

  res.json(payload);
  res.status(200).end();
});

//TIP Notification Handler
app.post("/proxy_route/notifications_receiver", async (req, res) => {
  const payload = req.body;
  const uuid = payload?.data?.uuid?.substring(5);

  switch (payload?.type) {
    case "USER_ID_PASS":
      console.log("### USER_ID_PASS");
      submitConsultancy(uuid);
      break;

    case "CONSULTATION_APPROVED":
      console.log("### CONSULTATION_APPROVED");
      placeOrder(payload?.data?.consultation?.uuid.substring(5));
      break;

    case "ORDER_FULFILLED":
      console.log("### ORDER_FULFILLED");
      // orderFulfilled(uuid);
      break;

    case "USER_ID_FAIL":
      console.log("### USER_ID_FAIL");
      // identityFailed(uuid);
      break;
  }

  console.log("### Notification Received Body:", JSON.stringify(payload));

  res.json({ message: "Notification has been received from App" });
  res.status(200).end();
});

//Consultations: Create Configuration
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

  console.log("### API: partners/consultations Body:", JSON.stringify(payload));
  console.log("### API: partners/consultations Response:", response);

  res.json(response);
  res.status(200).end();
});

// Start TIP API Backend
app.get("/api/tip", async (req, res) => {
  res.write("TIP API is live!");
  console.log("### TIP API is live!");
  res.status(200).end();
});

app.post("/api/tip/consultations/generate", async (req, res) => {
  const payload = req.body;
  const response = await fetch(
    `${TIP_HOST}/${TIP_API_VERSION}/partners/consultations/generate`,
    {
      method: "post",
      headers: tip_header,
      body: JSON.stringify(payload),
    }
  ).then((response) => response.json());

  console.log(
    "### API: partners/consultations/generate Body:",
    JSON.stringify(payload)
  );
  console.log(
    "### API: partners/consultations/generate Response:",
    JSON.stringify(response)
  );

  res.json(response);
  res.status(200).end();
});

app.post("/api/tip/consultations", async (req, res) => {
  const payload = req.body;
  const response = await fetch(
    `${TIP_HOST}/${TIP_API_VERSION}/partners/consultations`,
    {
      method: "post",
      headers: tip_header,
      body: JSON.stringify(payload),
    }
  ).then((response) => response.json());

  console.log("### API: partners/consultations Body:", JSON.stringify(payload));
  console.log(
    "### API: partners/consultations Response:",
    JSON.stringify(response)
  );

  res.json(response);
  res.status(200).end();
});
// Shopify APIs

// /proxy_route/fulfillment
// /api/order/fulfillment

app.post("/proxy_route/fulfillment", async (req, res) => {
  // orderFulfilled();

  console.log("Hit the API");

  const url = new URL(req.url);
  const shop = url.searchParams.get("shop");
  const sanitizedShop = shopify.utils.sanitizeShop(shop, true);

  if (!sanitizedShop) {
    throw new Error("Invalid shop provided");
  }

  await someOfflineProcess(sanitizedShop);

  res.json("response");
  res.status(200).end();
});

async function someOfflineProcess(shop) {
  const sessionId = await shopify.api.session.getOfflineId(shop);
  const session = await shopify.config.sessionStorage.loadSession(sessionId);
  const client = new shopify.api.clients.Rest({ session });

  console.log(sessionId);
  console.log(session);
  console.log(client);

  // Use the client, e.g. update a product:
  // const products = await client.put({
  //   path: `products/${product.id}.json`,
  //   data,
  // });
}

app.post("/api/products/fulfillment", async (_req, res) => {
  // Session is built by the OAuth process
  const fulfillment = await shopify.api.rest.Fulfillment({
    session: res.locals.shopify.session,
  });
  fulfillment.line_items_by_fulfillment_order = [
    {
      fulfillment_order_id: 5377732804916,
    },
  ];
  fulfillment.tracking_info = {
    number: "KN423722033GB",
    url: "https://www.royalmail.com/track-your-item?trackNumber=KN423722033GB",
  };
  await fulfillment.save({
    update: true,
  });

  res.json("response");
  res.status(200).end();
});

app.get("/api/products/test", async (_req, res) => {
  const testsData = "This is the test data";
  res.status(200).send(testsData);
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

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

connectToDB(() => {
  console.log("### Successfully connect to the database!");
  app.listen(PORT, () => {
    console.log("### Server is listening to port: " + PORT);
  });
});
