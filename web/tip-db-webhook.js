//@ts-check
import { DB } from "./db.js";
import { dataAggregate } from "./tip-db-aggregator.js";

//Webhook: User info to DB
const OrderSubmit = async (webhookResponse) => {
  const line_items_uuid = webhookResponse?.line_items[0]?.properties[0]?.value;
  const product_id = webhookResponse?.line_items[0]?.product_id;

  console.log("line_items_uuid:", line_items_uuid);

  if (product_id) {
    const data_order = DB.collection("data_order");
    const createdAt = webhookResponse?.created_at;
    const order_id = webhookResponse?.id;
    const orderCustomer = webhookResponse?.customer;
    const orderBillingAddress = webhookResponse?.billing_address;
    const orderShippingAddress = webhookResponse?.shipping_address;

    const result = await data_order.insertOne({
      created_at: createdAt,
      line_items_uuid: line_items_uuid,
      order_id: order_id,
      product_id: product_id,
      // quantity: orderCustomer?.quantity,
      customer_id: orderCustomer?.id,
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
    if (line_items_uuid != null) {
      dataAggregate(line_items_uuid);
    }
  } else {
    console.log("There is error in Payload!");
  }
};

export { OrderSubmit };
