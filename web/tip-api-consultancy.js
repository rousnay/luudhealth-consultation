//@ts-check
import { DB } from "./db.js";

//Webhook: User info to DB
const OrderSubmit = async (webhookResponse) => {
  const order_id = webhookResponse?.id;
  const line_items_uuid = webhookResponse?.line_items[0]?.properties[0]?.value;

  console.log("Body", order_id);

  if (order_id) {
    const order_data = DB.collection("order_data");
    const orderCustomer = webhookResponse?.customer;
    const orderBillingAddress = webhookResponse?.billing_address;
    const orderShippingAddress = webhookResponse?.shipping_address;
    const orderLineItems = webhookResponse?.line_items;

    const result = await order_data.insertOne({
      order_id: order_id,
      customer_id: orderCustomer?.id,
      line_items_uuid: line_items_uuid,
      customer: {
        firstname: orderCustomer?.first_name,
        lastname: orderCustomer?.last_name,
        email: orderCustomer?.email || "NotFound",
        phone: orderCustomer?.phone || "NotFound",
      },
      billing_address: {
        businessName: orderBillingAddress?.company || "NotFound",
        address1: orderBillingAddress?.address1,
        address2: orderBillingAddress?.address2 || "NotFound",
        city: orderBillingAddress?.city,
        county: orderBillingAddress?.country,
        postcode: orderBillingAddress?.zip,
      },
      shipping_address: {
        businessName: orderShippingAddress?.company || "NotFound",
        address1: orderShippingAddress?.address1,
        address2: orderShippingAddress?.address2 || "NotFound",
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
