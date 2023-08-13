//@ts-check
import { DeliveryMethod } from "@shopify/shopify-api";
import { OrderSubmit } from "./tip-db-checkout.js";
// import { OrderNonPresSubmit } from "./tip-db-checkout-nonpres.js";

const receivedWebhooks = {};
export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },

  // PRODUCTS_UPDATE: {
  //   deliveryMethod: DeliveryMethod.Http,
  //   callbackUrl: "/api/webhooks",
  //   callback: async (topic, shop, body, webhookId) => {
  //     // Check we haven't already receieved this webhook
  //     if (receivedWebhooks[webhookId]) return;
  //     // Add to our list of receieved webhooks
  //     receivedWebhooks[webhookId] = true;
  //     // Add to our queue for processing
  //     console.log("+++++++++Product Update!++++++++++++");
  //     // const product = JSON.parse(body);
  //     // console.log(product);
  //     console.log("IDs of all received webhooks:");
  //     console.log(receivedWebhooks);
  //     // productTaggingQueue.push({ shop, product });
  //   },
  // },

  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receivedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receivedWebhooks[webhookId] = true;
      // Add to our queue for processing
      console.log("+++++++++Orders Create!++++++++++++");
      const ordersCreate = JSON.parse(body);
      // console.log(ordersCreate);
      // console.log("## IDs of all received webhooks:");
      // console.log(receivedWebhooks);
    },
  },

  ORDERS_UPDATED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receivedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receivedWebhooks[webhookId] = true;
      // Add to our queue for processing
      console.log("+++++++++Orders Updated!++++++++++++");
      // const ordersUpdated = JSON.parse(body);
      // console.log(ordersUpdated);
      // console.log("## IDs of all received webhooks:");
      // console.log(receivedWebhooks);
    },
  },

  ORDERS_DELETE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receivedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receivedWebhooks[webhookId] = true;
      // Add to our queue for processing
      console.log("+++++++++Order Delete!++++++++++++");
      // const ordersDeleted = JSON.parse(body);
      // console.log(ordersDeleted);
      // console.log("## IDs of all received webhooks:");
      // console.log(receivedWebhooks);
    },
  },

  CUSTOMERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receivedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receivedWebhooks[webhookId] = true;
      // Add to our queue for processing
      console.log("## +++++Customers Create!++++++++++++");
      // const customersCreate = JSON.parse(body);
      // console.log(customersCreate);
      // console.log("## IDs of all received webhooks:");
      // console.log(receivedWebhooks);
    },
  },

  ORDERS_PAID: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receivedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receivedWebhooks[webhookId] = true;
      // Add to our queue for processing
      console.log("## +++Orders Paid +++++++++++");
      const ordersPaid = JSON.parse(body);
      const has_submission_uuid =
        ordersPaid?.line_items[0]?.properties[0]?.name == "_submission_uuid";
      console.log("## WEBHOOK: Has submission_uuid? :", has_submission_uuid);
      if (has_submission_uuid) {
        OrderSubmit(ordersPaid);
      } else {
        console.log("## NON-TIP Products");
      }
      console.log(
        "## WEBHOOK: Paid order Payload:",
        JSON.stringify(ordersPaid)
      );
      // console.log("## IDs of all received webhooks:");
      // console.log(receivedWebhooks);
    },
  },
};
