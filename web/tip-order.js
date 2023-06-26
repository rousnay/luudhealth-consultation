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
    console.log("Not found,but:", DBCollection);
  }
  const document = await collection.findOne({ line_items_uuid: uuid });

  if (document) {
    console.log("Found document:", document);
    return document;
  } else {
    console.log("Document not found");
    return null;
  }
}
// data_consultancy, data_medical, data_order
const placeOrder = async (lineItemsUuid) => {
  const data_medical = await findDocumentByUuid(2, lineItemsUuid);
  const data_order = await findDocumentByUuid(3, lineItemsUuid);

  const order_data = {
    uuid: "IPS-O" + lineItemsUuid,

    delivery: {
      salutation: "Mr",
      firstname: data_order?.customer?.firstname,
      middlename: data_order?.customer?.firstname || "",
      lastname: data_order?.customer?.lastname,
      phone: data_medical?.medical?.phone,
      email: data_order?.customer?.email || "",
      notes: "Example of a note must be max 24 character",
      address: data_order?.shipping_address,

      post_through_letterbox: false,
    },

    billing: {
      salutation: "Mr",
      firstname: data_order?.customer?.firstname,
      middlename: data_order?.customer?.firstname || "",
      lastname: data_order?.customer?.lastname,
      address: data_order?.billing_address,
    },

    patient: {
      uuid: "IPS-P" + lineItemsUuid,
      salutation: "Mr",
      firstname: data_order?.customer?.firstname,
      middlename: data_order?.customer?.firstname || "",
      lastname: data_order?.customer?.lastname,
      phone: data_medical?.medical?.phone,
      email: data_order?.customer?.email || "",
      dob: data_medical?.medical?.dob,
      address: data_order?.billing_address,
      special_dispensing_instructions: "Example",
    },

    items: [
      {
        treatment: 6257,
        quantity: data_order?.quantity,
        total: 1,
        consultation: "IPS-C" + lineItemsUuid,
      },
    ],
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

    console.log("## API: partners/orders Body:", orderPayload);

    if (response.status === 200) {
      console.log("## API: partners/orders Response:", response);
    } else if (response.status === 201) {
      console.log("#### API: ORDER CREATED!", response);
    } else {
      console.log("## Error with order place");
      console.log("## API: partners/orders Response:", response);
    }
  };

  tipOrder(order_data);

  // return
};

export { placeOrder };
