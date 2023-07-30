//@ts-check
import crypto from "crypto";
import { DB } from "./db.js";
import { dataAggregate } from "./tip-db-aggregator.js";
import { placeOrderNonPres } from "./tip-submit-order-nonpres.js";

const generated_uuid = crypto.randomUUID();

//Webhook: User info to DB
const OrderSubmit = async (webhookResponse) => {
  let line_items_uuid = webhookResponse?.line_items[0]?.properties[0]?.value;
  let order_type = "Non-TIP";
  const product_id = webhookResponse?.line_items[0]?.product_id;

  if (line_items_uuid === null && product_id != 8040651292980) {
    console.log("Product Type: Non-TIP");
  } else if (product_id === 8040651292980) {
    console.log("Product Type: Non-prescribed");
    order_type = "Non-prescribed";
    line_items_uuid = line_items_uuid ?? generated_uuid;
  } else {
    console.log("Product Type: Prescribed");
    order_type = "Prescribed";
  }

  // console.log("## line_items_uuid:", line_items_uuid);

  if (line_items_uuid != null) {
    const data_order = DB.collection("data_order");
    const createdAt = webhookResponse?.created_at;
    const order_number = webhookResponse?.order_number;
    const order_id = webhookResponse?.id;
    const total_price = webhookResponse?.current_total_price;
    const quantity = webhookResponse?.line_items[0]?.quantity;
    const orderCustomer = webhookResponse?.customer;
    const orderBillingAddress = webhookResponse?.billing_address;
    const orderShippingAddress = webhookResponse?.shipping_address;
    const line_items = webhookResponse?.line_items;

    const items = line_items.map((item) => {
      const newItem = {
        id: item.id,
        total: parseFloat(item.price),
        quantity: item.quantity,
      };

      item.properties.forEach((property) => {
        newItem[property.name] = property.value;
      });

      return newItem;
    });

    // ********* NEED TO UPDATE *********
    // add treatmentID and consultation ID in line_items array via forms
    // ********* NEED TO UPDATE *********

    const result = await data_order.insertOne({
      created_at: createdAt,
      order_type: order_type,
      line_items_uuid: line_items_uuid,
      order_number: order_number,
      customer_name: orderCustomer?.first_name + " " + orderCustomer?.last_name,
      customer_id: orderCustomer?.id,
      order_id: order_id,
      product_id: product_id,
      quantity: quantity,
      total_price: parseInt(total_price),
      customer: {
        firstname: orderCustomer?.first_name,
        middlename: orderCustomer?.middle_name || "",
        lastname: orderCustomer?.last_name,
        email: orderCustomer?.email || "",
        phone: orderCustomer?.phone || "",
      },
      billing_address: {
        businessName: orderBillingAddress?.company || "",
        address1: orderBillingAddress?.address1,
        address2: orderBillingAddress?.address2 || "",
        city: orderBillingAddress?.city,
        county: orderBillingAddress?.country,
        postcode: orderBillingAddress?.zip,
      },
      shipping_address: {
        businessName: orderShippingAddress?.company || "",
        address1: orderShippingAddress?.address1,
        address2: orderShippingAddress?.address2 || "",
        city: orderShippingAddress?.city,
        county: orderShippingAddress?.country,
        postcode: orderShippingAddress?.zip,
      },
      line_items: items,
    });
    console.log(
      `## A document was inserted with the _id: ${result.insertedId}`
    );
    if (product_id === 8040651292980) {
      placeOrderNonPres(line_items_uuid);
    } else {
      dataAggregate(line_items_uuid);
    }
  } else {
    console.log("## There is error in Payload!");
  }
};

export { OrderSubmit };
