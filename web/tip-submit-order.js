import { DB } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const TIP_HOST = process.env.TIP_HOST;
const TIP_API_VERSION = process.env.TIP_API_VERSION;
const TIP_CLIENT_ID = process.env.TIP_CLIENT_ID;
const TIP_TOKEN = process.env.TIP_TOKEN;
const tip_header = {
  Client: TIP_CLIENT_ID,
  Authorization: "Bearer " + TIP_TOKEN,
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function findDocumentByUuid(DBCollection, uuid) {
  let collection;

  if (DBCollection == 2) {
    collection = DB.collection("data_medical");
  } else if (DBCollection == 3) {
    collection = DB.collection("data_order");
  } else {
    console.log("Not found, but:", DBCollection);
  }
  const document = await collection.findOne({ submission_uuid: uuid });

  if (document) {
    console.log("Document has found");
    return document;
  } else {
    console.log("Document not found");
    return null;
  }
}
// data_consultancy, data_medical, data_order
const placeOrder = async (submissionUuid) => {
  const data_medical = await findDocumentByUuid(2, submissionUuid);
  const data_order = await findDocumentByUuid(3, submissionUuid);
  const salutation = data_medical?.medical?.gender === "female" ? "Ms" : "Mr";

  const order_data = {
    uuid: "O" + submissionUuid,
    brand: "Luud Heath",
    partner_references: [data_order?.order_number],
    delivery: {
      reference: 43,
      salutation: salutation,
      firstname: data_order?.customer?.firstname,
      // middlename: data_order?.customer?.firstname,
      lastname: data_order?.customer?.lastname,
      phone: data_medical?.medical?.phone,
      email: data_order?.customer?.email,
      notes: "Example of a note must be max 24 character",
      address: data_order?.shipping_address,

      post_through_letterbox: false,
    },

    billing: {
      salutation: salutation,
      firstname: data_order?.customer?.firstname,
      // middlename: data_order?.customer?.firstname,
      lastname: data_order?.customer?.lastname,
      address: data_order?.billing_address,
    },

    patient: {
      uuid: "P" + submissionUuid,
      salutation: salutation,
      firstname: data_order?.customer?.firstname,
      // middlename: data_order?.customer?.firstname,
      lastname: data_order?.customer?.lastname,
      phone: data_medical?.medical?.phone,
      email: data_order?.customer?.email,
      dob: data_medical?.medical?.dob,
      address: data_order?.billing_address,
      special_dispensing_instructions: "Example",
    },

    items: [
      {
        treatment: data_order?.line_items[0]?.sku,
        quantity: data_order?.line_items[0]?.quantity,
        total: data_order?.total_price,
        consultation: "LUUD-C" + submissionUuid,
      },
    ],
  };

  // console.log(JSON.stringify(order_data));
  const storeOrderDataToDB = async (orderPayload_data, response_data) => {
    console.log("## Form: Medical -> Submit");
    // const order_id = webhookResponse?.id;
    if (orderPayload_data) {
      const submitted_order = DB.collection("submitted_order");
      const result = await submitted_order.insertOne({
        submitted_at: new Date().toJSON(),
        order_uuid: orderPayload_data?.uuid,
        order_data: orderPayload_data,
        response_data: response_data,
      });
      console.log(
        `## A document was inserted with the _id: ${result.insertedId}`
      );
    } else {
      console.log("## There is error in Payload!");
    }
  };

  const tipOrder = async (orderPayload) => {
    const response = await fetch(
      `${TIP_HOST}/${TIP_API_VERSION}/partners/orders`,
      {
        method: "post",
        headers: tip_header,
        body: JSON.stringify(orderPayload),
      }
    ).then((response) => response.json());

    console.log("## API: partners/orders Body:", JSON.stringify(orderPayload));

    storeOrderDataToDB(orderPayload, response);

    if (response.status === 200) {
      console.log(
        "## API: partners/orders Response:",
        JSON.stringify(response)
      );
      return "OK";
    } else if (response.status === 201) {
      console.log("## Order has been created!", JSON.stringify(response));
      return "Order has been created!";
    } else {
      console.log("## Error with order creation", JSON.stringify(response));
      return response;
    }
  };

  const orderStatus = await tipOrder(order_data);
  return orderStatus;
};

export { placeOrder };
