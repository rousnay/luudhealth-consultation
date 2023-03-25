import { DeliveryMethod } from "@shopify/shopify-api";
const receievedWebhooks = {};
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
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },

  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receievedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receievedWebhooks[webhookId] = true;
      // Add to our queue for processing
      const product = JSON.parse(body);
      console.log("+++++++++Product Update!++++++++++++");
      console.log(product);
      console.log("+++++++++receievedWebhooks:++++++++++++");
      console.log(receievedWebhooks);

      // productTaggingQueue.push({ shop, product });
    },
  },

  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receievedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receievedWebhooks[webhookId] = true;
      // Add to our queue for processing
      const product = JSON.parse(body);
      console.log("+++++++++Order Create!++++++++++++");
      console.log(product);
      console.log("+++++++++receievedWebhooks:++++++++++++");
      console.log(receievedWebhooks);

      // productTaggingQueue.push({ shop, product });
    },
  },

  ORDERS_PAID: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receievedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receievedWebhooks[webhookId] = true;
      // Add to our queue for processing
      const product = JSON.parse(body);
      console.log("+++++++++Order Paid!++++++++++++");
      console.log(product);
      console.log("+++++++++receievedWebhooks:++++++++++++");
      console.log(receievedWebhooks);

      // productTaggingQueue.push({ shop, product });
    },
  },

  ORDERS_UPDATED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receievedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receievedWebhooks[webhookId] = true;
      // Add to our queue for processing
      const product = JSON.parse(body);
      console.log("+++++++++Order Updated!++++++++++++");
      console.log(product);
      console.log("+++++++++receievedWebhooks:++++++++++++");
      console.log(receievedWebhooks);

      // productTaggingQueue.push({ shop, product });
    },
  },

  ORDERS_DELETE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receievedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receievedWebhooks[webhookId] = true;
      // Add to our queue for processing
      const product = JSON.parse(body);
      console.log("+++++++++Order Delete!++++++++++++");
      console.log(product);
      console.log("+++++++++receievedWebhooks:++++++++++++");
      console.log(receievedWebhooks);

      // productTaggingQueue.push({ shop, product });
    },
  },

  CUSTOMERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      // Check we haven't already receieved this webhook
      if (receievedWebhooks[webhookId]) return;
      // Add to our list of receieved webhooks
      receievedWebhooks[webhookId] = true;
      // Add to our queue for processing
      const product = JSON.parse(body);
      console.log("+++++++++Customer Create!++++++++++++");
      console.log(product);
      console.log("+++++++++receievedWebhooks:++++++++++++");
      console.log(receievedWebhooks);

      // productTaggingQueue.push({ shop, product });
    },
  },
};
