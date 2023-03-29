//@ts-check
import { DB } from "./db.js";

//Webhook: User info to DB
const OrderSubmit = async (webhookResponse) => {
  console.log("Webhook: Order -> Submit");
  console.log("Body", webhookResponse);
  const order_id = webhookResponse?.id;

  if (order_id) {
    const order_data = DB.collection("order_data");
    const orderCustomer = webhookResponse?.customer;
    const orderBillingAddress = webhookResponse?.billing_address;
    const orderShippingAddress = webhookResponse?.shipping_address;

    const result = await order_data.insertOne({
      order_id: order_id,
      customer_id: orderCustomer?.id,
      customer: {
        firstname: orderCustomer?.first_name,
        lastname: orderCustomer?.last_name,
        email: orderCustomer?.email || "Not found",
        phone: orderCustomer?.phone || "Not found",
      },
      billing_address: {
        businessName: orderBillingAddress?.company || "Not found",
        address1: orderBillingAddress?.address1,
        address2: orderBillingAddress?.address2 || "Not found",
        city: orderBillingAddress?.city,
        county: orderBillingAddress?.country,
        postcode: orderBillingAddress?.zip,
      },
      shipping_address: {
        businessName: orderShippingAddress?.company || "Not found",
        address1: orderShippingAddress?.address1,
        address2: orderShippingAddress?.address2 || "Not found",
        city: orderShippingAddress?.city,
        county: orderShippingAddress?.country,
        postcode: orderShippingAddress?.zip,
      },
    });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } else {
    console.log("There is error in Payload!");
  }
};

export { OrderSubmit };
