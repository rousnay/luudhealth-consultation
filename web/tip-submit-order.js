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

// data_order
const placeOrder = async (submissionUuid) => {
  const data_order = await findDocumentByUuid(3, submissionUuid);
  const line_items = data_order?.items;

  const items = line_items.map((item, index) => {
    const newItem = {
      quantity: item?.quantity,
      total: Math.round(item?.total),
      treatment: parseInt(item?.sku),
    };

    if (item?._treatment_type !== "non_pharmacy") {
      newItem.consultation = `LUUD-CON-${index}-${item?._submission_uuid}-${submissionUuid}`;
    }

    return newItem;
  });

  const order_data = {
    uuid: "LUUD-ORD-" + submissionUuid,
    partner_references: [data_order?.order_number],
    delivery: {
      reference: 43,
      firstname: data_order?.customer?.firstname,
      lastname: data_order?.customer?.lastname,
      email: data_order?.customer?.email,
      notes: "",
      address: data_order?.shipping_address,
      post_through_letterbox: false,
    },

    billing: {
      firstname: data_order?.customer?.firstname,
      lastname: data_order?.customer?.lastname,
      address: data_order?.billing_address,
    },

    patient: {
      uuid: "LUUD-PAT-" + submissionUuid,
      firstname: data_order?.customer?.firstname,
      lastname: data_order?.customer?.lastname,
      email: data_order?.customer?.email,
      address: data_order?.billing_address,
      special_dispensing_instructions: "Example",
    },

    items: items,
  };

  // manipulate user data based on non-tip and tip products
  const defaultMedicalData = data_order?.patient_info ?? {
    phone: "6721",
    gender: "male",
    dob: "2001-01-01",
  };

  const { phone, gender, dob } = defaultMedicalData;
  const salutation = gender === "female" ? "Ms" : "Mr";

  order_data.delivery.salutation = salutation;
  order_data.delivery.phone = phone;
  order_data.billing.salutation = salutation;
  order_data.patient.salutation = salutation;
  order_data.patient.gender = gender;
  order_data.patient.dob = dob;
  order_data.patient.phone = phone;

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
