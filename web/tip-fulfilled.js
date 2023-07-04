import fetch from "node-fetch";
import { DB } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const TIP_HOST = process.env.TIP_HOST;
const TIP_API_VERSION = process.env.TIP_API_VERSION;
const TIP_CLIENT_ID = process.env.TIP_CLIENT_ID;
const TIP_TOKEN = process.env.TIP_TOKEN;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOP = process.env.SHOP;
const OFFLINE_AT = process.env.OFFLINE_AT;

const API_HEADER = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": OFFLINE_AT,
};

const orderId = "5377732804916";

async function findDocumentByUuid(uuid) {
  const collection = DB.collection("data_order");
  const document = await collection.findOne({ line_items_uuid: uuid });
  if (document) {
    console.log("Found document:", document);
    return document;
  } else {
    console.log("Document not found");
    return null;
  }
}

const orderFulfilled = async (shop, lineItemsUuid, fulfillment_data) => {
  const data_order = await findDocumentByUuid(lineItemsUuid);
  const order_id = data_order?.order_id;
  const fulfillment_orders_api = `https://${shop}.myshopify.com/admin/api/2023-01/orders/${order_id}/fulfillment_orders.json`;
  const fulfillments_api = `https://${shop}.myshopify.com/admin/api/2023-01/fulfillments.json`;

  const fulfillment_orders_response = await fetch(fulfillment_orders_api, {
    method: "GET",
    headers: API_HEADER,
  }).then((response) => response.json());

  if (fulfillment_orders_response.status === 200) {
    console.log("Fulfillment Orders:", fulfillment_orders_response);

    const fulfillment_payload = {
      // fulfillment: {
      //   location_id: fulfillment_data?.location_id || null,
      //   tracking_number: fulfillment_data?.tracking_no,
      //   tracking_company: fulfillment_data?.tracking_company || "Royal Mail",
      //   tracking_link: fulfillment_data?.tracking_link,
      //   expected_at: fulfillment_data?.expected_at,
      //   line_items: [
      //     {
      //       id: 5377732804916,
      //     },
      //   ],
      // },
      fulfillment: {
        message: "Package Shipped",
        notify_customer: false,
        line_items_by_fulfillment_order: [
          {
            fulfillment_order_id:
              fulfillment_orders_response?.fulfillment_orders[0]?.id,
            fulfillment_order_line_items: [],
          },
        ],
        tracking_info: {
          company: "Royal Mail",
          number: fulfillment_data?.tracking_no,
          url: fulfillment_data?.tracking_link,
          expected_at: fulfillment_data?.expected_at,
        },
      },
    };

    const fulfillments_response = await fetch(fulfillments_api, {
      method: "POST",
      headers: API_HEADER,
      body: JSON.stringify(fulfillment_payload),
    }).then((response) => response.json());

    if (fulfillments_response.status === 200) {
      console.log("Order Fulfilled:", fulfillments_response);
      return "Order Fulfilled";
    }
  }
};
export { orderFulfilled };