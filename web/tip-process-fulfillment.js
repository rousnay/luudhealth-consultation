import fetch from "node-fetch";
import { DB } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

// const SHOP = process.env.SHOP;
const PRD_SHOP = process.env.PRD_SHOP;
const OFFLINE_AT = process.env.OFFLINE_AT;

const API_HEADER = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": OFFLINE_AT,
};

async function findDocumentByUuid(uuid) {
  const collection = DB.collection("data_order");
  const document = await collection.findOne({ submission_uuid: uuid });
  if (document) {
    console.log("Document has found");
    return document;
  } else {
    console.log("Document not found");
    return null;
  }
}

const orderFulfilled = async (lineItemsUuid, fulfillment_data) => {
  const data_order = await findDocumentByUuid(lineItemsUuid);
  const order_id = data_order?.order_id;
  const fulfillment_orders_api = `https://${PRD_SHOP}/admin/api/2023-01/orders/${order_id}/fulfillment_orders.json`;
  const fulfillments_api = `https://${PRD_SHOP}/admin/api/2023-01/fulfillments.json`;

  const fulfillment_orders_response = await fetch(fulfillment_orders_api, {
    method: "GET",
    headers: API_HEADER,
  }).then((response) => response.json());

  const fulfillment_order_id =
    fulfillment_orders_response?.fulfillment_orders[0]?.id;

  if (fulfillment_order_id) {
    const fulfillment_payload = {
      fulfillment: {
        // location_id: fulfillment_data?.location_id || null,
        notify_customer: true,
        message: "The package has been shipped",
        line_items_by_fulfillment_order: [
          {
            fulfillment_order_id: fulfillment_order_id,
            // fulfillment_order_line_items: [],
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

    const fulfillmentStatus =
      fulfillments_response?.fulfillment?.status === "success"
        ? "Order has been fulfilled successfully!"
        : "Order has not fulfilled!";
    console.log(fulfillmentStatus);
    return fulfillmentStatus;
  } else {
    console.log("Fulfillment order has not found!");
    return "Fulfillment order has not Found!";
  }
};
export { orderFulfilled };
