//@ts-check
import { DB } from "./db.js";
import { dataAggregate } from "./tip-db-aggregator.js";
import { placeOrderNonPres } from "./tip-submit-order-nonpres.js";

// import crypto from "crypto";
// const generated_uuid = crypto.randomUUID();

//Webhook: User info to DB
const OrderSubmit = async (webhookResponse, submission_uuid) => {
  const order_type =
    webhookResponse?.line_items.length > 1 ? "Multiple" : "Single";

  if (submission_uuid != null) {
    const data_order = DB.collection("data_order");
    const createdAt = webhookResponse?.created_at;
    const order_number = webhookResponse?.order_number;
    const order_id = webhookResponse?.id;
    const total_price = webhookResponse?.current_total_price;
    const orderCustomer = webhookResponse?.customer;
    const orderBillingAddress = webhookResponse?.billing_address;
    const orderShippingAddress = webhookResponse?.shipping_address;
    const line_items = webhookResponse?.line_items;

    const items = line_items.map((item) => {
      const newItem = {
        // order_uuid: submission_uuid,
        id: item?.id,
        sku: parseInt(item?.sku),
        title: item?.title,
        product_id: item?.product_id,
        total: parseFloat(item?.price),
        quantity: item?.quantity,
      };

      item.properties.forEach((property) => {
        newItem[property.name] = property.value;
      });

      return newItem;
    });

    const result = await data_order.insertOne({
      created_at: createdAt,
      submission_uuid: submission_uuid,
      order_type: order_type,
      order_number: order_number,
      customer_name: orderCustomer?.first_name + " " + orderCustomer?.last_name,
      customer_id: orderCustomer?.id,
      order_id: order_id,
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
      items: items,
    });
    console.log(
      `## A document was inserted with the _id: ${result.insertedId}`
    );

    // Adding the "submissionUuid" as "order_uuid" to the collections "data_condition," "data_medical," and "data_consultancy"

    async function updateCollectionWithOrderId(collectionName, submissionUuid) {
      const collection = DB.collection(collectionName); // Use the imported DB connection

      const filter = { _submission_uuid: submissionUuid };
      const updateDoc = { $set: { order_id: order_id } };

      await collection.updateMany(filter, updateDoc);
    }

    async function processLineItems() {
      const uniqueSubmissionUuids = [
        ...new Set(items.map((item) => item._submission_uuid)),
      ];

      console.log("## Unique submission_uuids:", uniqueSubmissionUuids);

      for (const submissionUuid of uniqueSubmissionUuids) {
        // Update data_condition, data_medical, and data_consultancy collections
        await updateCollectionWithOrderId("data_condition", submissionUuid);
        await updateCollectionWithOrderId("data_medical", submissionUuid);
        await updateCollectionWithOrderId("data_consultancy", submissionUuid);
      }
    }

    processLineItems()
      .then(() => {
        console.log("## Documents updated successfully with order_id.");
      })
      .catch((err) => {
        console.error("## Error updating documents with order_id:", err);
      });

    // ********* NEED TO UPDATE *********
    const first_line_item_properties =
      webhookResponse?.line_items[0]?.properties;
    let treatment_type;

    for (const obj of first_line_item_properties) {
      if (obj.name === "_treatment_type") {
        treatment_type = obj.value;
        break; // Exit the loop once the value is found
      }
    }
    if (order_type === "Single" && treatment_type === "non_pharmacy") {
      placeOrderNonPres(submission_uuid);
    } else {
      dataAggregate(submission_uuid);
    }
    // ********* NEED TO UPDATE *********
  } else {
    console.log("## There is error in Payload!");
  }
};

export { OrderSubmit };
