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

async function findDocumentByUuid(uuid) {
  const collection = DB.collection("data_order");
  const document = await collection.findOne({ line_items_uuid: uuid });
  if (document) {
    console.log("Document has found");
    return document;
  } else {
    console.log("Document not found");
    return null;
  }
}

// data_consultancy, data_medical, data_order
const placeOrderNonPres = async (submissionUuid) => {
  const data_order = await findDocumentByUuid(submissionUuid);
  // const salutation = data_medical?.medical?.gender === "female" ? "Ms" : "Mr";
  const salutation = "Mr";

  const order_data = {
    uuid: "IPS-O" + submissionUuid,
    brand: "Luud Heath",
    partner_references: [data_order?.order_number],
    delivery: {
      reference: 43,
      salutation: salutation,
      firstname: data_order?.customer?.firstname,
      // middlename: data_order?.customer?.firstname,
      lastname: data_order?.customer?.lastname,
      // phone: data_medical?.medical?.phone,
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
      uuid: "IPS-P" + lineItemsUuid,
      salutation: salutation,
      firstname: data_order?.customer?.firstname,
      // middlename: data_order?.customer?.firstname,
      lastname: data_order?.customer?.lastname,
      email: data_order?.customer?.email,
      phone: "6721",
      dob: "2001-01-01",
      address: data_order?.billing_address,
      special_dispensing_instructions: "Non-prescription",
    },

    items: [
      {
        treatment: 6721,
        quantity: data_order?.quantity,
        total: data_order?.total_price,
        // consultation: "IPS-C" + lineItemsUuid,
      },
    ],
  };

  console.log(JSON.stringify(order_data));

  const tipOrder = async (orderPayload) => {
    const response = await fetch(
      `${TIP_HOST}/${TIP_API_VERSION}/partners/orders`,
      {
        method: "post",
        headers: tip_header,
        body: JSON.stringify(orderPayload),
      }
    ).then((response) => response.json());

    // console.log("## API: partners/orders Body:", orderPayload);

    if (response.status === 200) {
      console.log("## API: partners/orders Response:", response);
      return "OK";
    } else if (response.status === 201) {
      console.log("## Order has been created!", response);
      return "Order has been created!";
    } else {
      console.log("## Error with order creation", response);
      return response;
    }
  };

  const orderStatus = await tipOrder(order_data);
  return orderStatus;
};

export { placeOrderNonPres };
