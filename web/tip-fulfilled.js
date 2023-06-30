import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const TIP_HOST = process.env.TIP_HOST;
const TIP_API_VERSION = process.env.TIP_API_VERSION;
const TIP_CLIENT_ID = process.env.TIP_CLIENT_ID;
const TIP_TOKEN = process.env.TIP_TOKEN;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOP = process.env.SHOP;

const orderId = "5377732804916";

function orderFulfilled(lineItemsUuid, fulfillment_data) {
  const endpoint = `https://iplaysafe-consultancy-app-store.myshopify.com/admin/api/2023-01/fulfillments.json`;

  const payload = {
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
          line_items_by_fulfillment_order: [
              {
                  fulfillment_order_id: orderId
              }
          ],
          tracking_info: {
              number: "KN423722033GB",
              url: "https://www.royalmail.com/track-your-item?trackNumber=KN423722033GB"
          }
      }

  };

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_API_KEY,
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Order fulfilled:", data);
    })
    .catch((error) => {
      console.error("Error fulfilling order:", error);
    });
}
export { orderFulfilled };

// https://shopify.dev/docs/api/admin-rest/2023-04/resources/fulfillment#post-fulfillments

// https://shopify.dev/docs/api/admin-rest/2023-04/resources/fulfillment#supported-tracking-companies
