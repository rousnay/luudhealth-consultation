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

import { connectToDB, DB } from "./db.js";
import {
  conditionSubmit,
  consultancySubmit,
  medicalSubmit,
} from "./tip-db-forms.js";
import {
  consultancySubmitter,
  consultancyApprovalProcessor,
} from "./tip-process-consultation.js";
import { orderFulfilled } from "./tip-process-fulfillment.js";
import {
  identityNotification,
  consultationNotification,
  orderNotification,
} from "./tip-db-notifications.js";

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
const OFFLINE_AT = process.env.OFFLINE_AT;

const tip_header = {
  Client: TIP_CLIENT_ID,
  Authorization: "Bearer " + TIP_TOKEN,
  Accept: "application/json",
  "Content-Type": "application/json",
};
// End Define TIP API Env

const app = express();

console.log("### SHOP:", SHOP);
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

  console.log(
    "### APP: current_assessment_form_type:",
    JSON.stringify(payload?.current_assessment_form_type)
  );

  if (payload?.current_assessment_form_type === "condition") {
    conditionSubmit(payload);
  } else {
    consultancySubmit(payload);
  }

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
  const uuid = payload?.data?.uuid?.substring(9);

  let responseObj = {
    statusCode: 200,
    statusText: "Notification has been received from App",
  };

  switch (payload?.type) {
    case "USER_ID_PASS":
      console.log("### USER_ID_PASS");
      responseObj = await consultancySubmitter(uuid);
      await identityNotification(payload);
      break;

    case "USER_ID_FAIL":
      console.log("### USER_ID_FAIL");
      await identityNotification(payload);
      break;

    case "CONSULTATION_APPROVED":
      console.log("### CONSULTATION_APPROVED");
      const full_uuid = payload?.data?.consultation?.uuid;
      const con_index = parseInt(full_uuid.split("-")[2]);
      const ord_uuid = full_uuid.split("-").slice(8).join("-");

      responseObj = await consultancyApprovalProcessor(con_index, ord_uuid);
      await consultationNotification(payload);
      break;

    case "CONSULTATION_DECLINED":
      console.log("### CONSULTATION_DECLINED");
      await consultationNotification(payload);
      break;

    case "ORDER_FULFILLED":
      console.log("### ORDER_FULFILLED");
      responseObj.statusText = await orderFulfilled(uuid, payload?.data);
      await orderNotification(payload);
      break;

    case "ORDER_CANCELLED":
      console.log("### ORDER_CANCELLED");
      await orderNotification(payload);
      break;

    default: {
      console.log("### Unknown Notification received.");
      console.log("### Payload:", JSON.stringify(payload));
      responseMessage = "Notification has been received from App";
    }
  }
  // console.log("### Notification Received Body:", JSON.stringify(payload));
  // res.json({ message: responseObj.statusText });
  // res.status(404).end();
  res
    .status(responseObj.statusCode)
    .json({ message: responseObj.statusText })
    .end();
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
// Shopify APIs
// /proxy_route/fulfillment
// /api/order/fulfillment
app.post("/proxy_route/fulfillment", async (req, res) => {
  // orderFulfilled();

  console.log("## Hit the API");

  // if (!req.query.shop) {
  //   res.status(500);
  //   return res.send("No shop provided");
  // }

  // const url = new URL(req.url);
  // const shop = url.searchParams.get("shop");
  // const sanitizedShop = shopify.utils.sanitizeShop(SHOP, true);

  // if (!sanitizedShop) {
  //   throw new Error("Invalid shop provided");
  // }

  await someOfflineProcess(SHOP);

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
  console.log("### SHOP:", SHOP);

  // Use the client, e.g. update a product:
  // const products = await client.put({
  //   path: `products/${product.id}.json`,
  //   data,
  // });
}

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

app.post("/api/fulfillment", async (_req, res) => {
  const fulfillment = await shopify.api.rest.Fulfillment({
    session: res.locals.shopify.session,
  });
  fulfillment.line_items_by_fulfillment_order = [
    {
      fulfillment_order_id: _req?.data?.f_order?.id,
    },
  ];
  fulfillment.tracking_info = {
    number: _req?.data?.f_order?.t_number,
    url: _req?.data?.f_order?.t_url,
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

app.get("/api/tip/orders/all", async (req, res) => {
  try {
    const ordersCollection = DB.collection("data_order");
    // const orderAggregatedCollection = DB.collection("data_aggregated");

    const identityCollection = DB.collection("submitted_identity");
    const notificationIdentityCollection = DB.collection(
      "notification_identity"
    );
    const submittedOrderCollection = DB.collection("submitted_order");
    const notificationOrderCollection = DB.collection("notification_order");

    // Fetch all orders from the data_aggregated collection
    const orders = await ordersCollection
      .find()
      .sort({ created_at: -1 })
      .toArray();

    // Iterate over each order and fetch the matching status and identity_verification_status
    const ordersWithAdditionalData = await Promise.all(
      orders.map(async (order) => {
        const submissionUuid = order.submission_uuid;
        const patientUuidPrefix = `LUUD-PAT-${submissionUuid}`;
        const orderUuidPrefix = `LUUD-ORD-${submissionUuid}`;

        let identity_submission_status = "--";
        let identity_verification_status = "--";

        // Fetch the matching document from submitted_identity collection
        const identityDoc = await identityCollection.findOne({
          patient_uuid: patientUuidPrefix,
        });

        if (identityDoc) {
          identity_submission_status =
            identityDoc.response_data.status === 200 ? "Submitted" : "Error";
        }

        // Fetch the matching document from notification_identity collection
        const notificationIdentityDoc =
          await notificationIdentityCollection.findOne({
            submission_uuid: patientUuidPrefix,
          });

        if (notificationIdentityDoc) {
          identity_verification_status =
            notificationIdentityDoc.type === "USER_ID_PASS" ? "Passed" : "Fail";
        }

        // Add the identity_verification to the order
        order.identity_verification =
          identity_submission_status + " / " + identity_verification_status;

        // Fetch the matching document from submitted_order collection
        const submittedOrderDoc = await submittedOrderCollection.findOne({
          order_uuid: orderUuidPrefix,
        });

        if (submittedOrderDoc) {
          // Add the status to the order if the document is found
          order.order_submission_status =
            submittedOrderDoc.response_data.status === 201
              ? "Submitted"
              : "Failed";
        } else {
          // Add a default status if no document is found
          order.order_submission_status = "--";
        }

        // Fetch the matching document from notification_order collection
        const notificationOrderDoc = await notificationOrderCollection.findOne({
          submission_uuid: orderUuidPrefix,
        });

        if (notificationOrderDoc) {
          // Add the type as status if the document is found
          order.order_fulfillment_status =
            notificationOrderDoc.type === "ORDER_FULFILLED"
              ? "Fulfilled"
              : "Cancelled";
        } else {
          // Add a default status if no document is found
          order.order_fulfillment_status = "--";
        }

        return order;
      })
    );

    // Send the orders with status and identity_verification_status as the response
    res.status(200).json(ordersWithAdditionalData);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/tip/orders/:number", async (req, res) => {
  try {
    const orderNumber = Number(req.params.number);
    const ordersCollection = DB.collection("data_order");
    const identityCollection = DB.collection("submitted_identity");
    const notificationIdentityCollection = DB.collection(
      "notification_identity"
    );

    const consultancyDataCollection = DB.collection(
      "data_consultancy"
    );
    const conditionDataCollection = DB.collection(
      "data_condition"
    );

    const submittedConsultationCollection = DB.collection(
      "submitted_consultation"
    );
    const notificationConsultationCollection = DB.collection(
      "notification_consultation"
    );

    const orderDataCollection = DB.collection("data_order");
    const submittedOrderCollection = DB.collection("submitted_order");
    const notificationOrderCollection = DB.collection("notification_order");

    // Fetch the order from the data_order collection by order_number
    const order = await ordersCollection.findOne({ order_number: orderNumber });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const submissionUuid = order.submission_uuid;
    const patientUuidPrefix = `LUUD-PAT-${submissionUuid}`;
    const consultationUuidRegExp = new RegExp(submissionUuid);
    const orderUuidPrefix = `LUUD-ORD-${submissionUuid}`;

    let orderDetails = {
      ...order,
      identity_data: {},
      consultation_data: {},
      order_data: {},
    };

    // Fetch the matching document from submitted_identity collection
    const identityDoc = await identityCollection.findOne({
      patient_uuid: patientUuidPrefix,
    });

    if (identityDoc) {
      orderDetails.identity_data.submitted = identityDoc;
    }

    // Fetch the matching document from notification_identity collection
    const notificationIdentityDoc =
      await notificationIdentityCollection.findOne({
        submission_uuid: patientUuidPrefix,
      });

    if (notificationIdentityDoc) {
      orderDetails.identity_data.notification = notificationIdentityDoc;
    }

    // Fetch the matching document from submitted_consultation collection
    const submittedConsultationDoc = await submittedConsultationCollection
      .find({
        consultancy_uuid: consultationUuidRegExp,
      })
      .toArray();

    if (submittedConsultationDoc) {
      orderDetails.consultation_data.submitted = submittedConsultationDoc;
    }

    // Fetch the matching document from notification_consultation collection
    const notificationConsultationDoc = await notificationConsultationCollection
      .find({
        submission_uuid: consultationUuidRegExp,
      })
      .toArray();

    if (notificationConsultationDoc) {
      orderDetails.consultation_data.notification = notificationConsultationDoc;
    }

    // Fetch the matching document from data_consultancy collection
    const consultancyDataDoc = await consultancyDataCollection.find({
      submission_uuid: consultationUuidRegExp,
    })
    .toArray();

    // Fetch the matching document from data_condition collection
    const conditionDataDoc = await conditionDataCollection.find({
      submission_uuid: consultationUuidRegExp,
    })
    .toArray();

    // Merge consultancyDataDoc and conditionDataDoc into a single array
    const mergedConsultationData = [
      ...consultancyDataDoc,
      ...conditionDataDoc,
    ];

    if (consultancyDataDoc || conditionDataDoc) {
      orderDetails.consultation_data.consultancy_data = mergedConsultationData;
    }

    // Fetch the matching document from submitted_order collection
    const submittedOrderDoc = await submittedOrderCollection.findOne({
      order_uuid: orderUuidPrefix,
    });

    if (submittedOrderDoc) {
      orderDetails.order_data.submitted = submittedOrderDoc;
    }

    // Fetch the matching document from notification_order collection
    const notificationOrderDoc = await notificationOrderCollection.findOne({
      submission_uuid: orderUuidPrefix,
    });

    if (notificationOrderDoc) {
      orderDetails.order_data.notification = notificationOrderDoc;
    }

    // Fetch the matching document from data_order collection
    const orderDataDoc = await orderDataCollection.findOne({
      submission_uuid: submissionUuid,
    });

    if (orderDataDoc) {
      orderDetails.order_data.order_info = orderDataDoc;
    }

    // Send the order with status and identity_verification_status as the response
    res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

connectToDB(() => {
  console.log("### SHOP:", SHOP);
  console.log("### Successfully connect to the database!");
  app.listen(PORT, () => {
    console.log("### Server is listening to port: " + PORT);
  });
});
