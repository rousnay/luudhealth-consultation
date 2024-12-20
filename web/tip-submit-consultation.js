import dotenv from "dotenv";
dotenv.config();

import { DB } from "./db.js";
import { placeOrder } from "./tip-submit-order.js";

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

  if (DBCollection == 1) {
    collection = DB.collection("data_condition");
  } else if (DBCollection == 2) {
    collection = DB.collection("data_consultancy");
  } else if (DBCollection == 3) {
    collection = DB.collection("data_medical");
  } else if (DBCollection == 4) {
    collection = DB.collection("data_order");
  } else {
    console.log("Not found,but:", DBCollection);
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
const submitConsultancy = async (index, item_uuid, order_uuid) => {
  const data_condition = await findDocumentByUuid(1, item_uuid);
  const data_consultancy = await findDocumentByUuid(2, item_uuid);
  const data_medical = await findDocumentByUuid(3, item_uuid);
  const data_order = await findDocumentByUuid(4, order_uuid);

  const consultancy_data = {
    uuid: `LUUD-CON-${index}-${item_uuid}-${order_uuid}`,
    type: "NEW",
    treatment: data_order?.items[index]?.sku,
    quantity: data_order?.items[index]?.quantity,
    patient: {
      uuid: "LUUD-PAT-" + order_uuid,
      salutation: "Mr",
      firstname: data_order?.customer?.firstname,
      // "middlename": "",
      lastname: data_order?.customer?.lastname,
      gender: data_medical?.medical?.gender,
      phone: data_medical?.medical?.phone,
      // "email": "example@example.com",
      dob: data_medical?.medical?.dob,
      address: data_order?.billing_address,
    },
    medical: {
      gender: data_medical?.medical?.gender,
    },
    consultation: data_consultancy?.consultancy,
  };

  const treatment_type = data_medical?.treatment_type;
  if (treatment_type === "od_medicine") {
    consultancy_data.conditionId = data_condition?.condition_id;
    consultancy_data.condition = data_condition?.condition;
  }

  const storeConsultancyDataToDB = async (
    consultancyPayload_data,
    response_data
  ) => {
    // const order_id = webhookResponse?.id;
    if (consultancyPayload_data) {
      const submitted_consultation = DB.collection("submitted_consultation");
      const result = await submitted_consultation.insertOne({
        submitted_at: new Date().toJSON(),
        consultancy_uuid: consultancyPayload_data?.uuid,
        consultancy_data: consultancyPayload_data,
        response_data: response_data,
      });
      console.log(
        `## A document was inserted with the _id: ${result.insertedId}`
      );
    } else {
      console.log("## There is error in Payload!");
    }
  };

  const tipConsultancy = async (consultancyPayload) => {
    const response = await fetch(
      `${TIP_HOST}/${TIP_API_VERSION}/partners/consultations`,
      {
        method: "post",
        headers: tip_header,
        body: JSON.stringify(consultancyPayload),
      }
    ).then((response) => response.json());

    console.log(
      "## API: partners/consultations Body:",
      JSON.stringify(consultancyPayload)
    );

    storeConsultancyDataToDB(consultancyPayload, response);

    if (response.status === 200) {
      console.log(
        "## API: partners/consultations Response:",
        JSON.stringify(response)
      );
      return "OK";
    } else if (response.status === 201) {
      console.log(
        "## consultation has been created!",
        JSON.stringify(response)
      );

      // ********* NEED TO UPDATE *********
      // const order_type = data_order?.order_type;

      // if (order_type === "Single" && treatment_type === "otc_medicine") {
      //   const responseMessage = await placeOrder(order_uuid);
      //   console.log(
      //     "OTC Order submission response:",
      //     JSON.stringify(responseMessage)
      //   );
      // }
      // ********* NEED TO UPDATE *********

      return "consultation has been created!";
    } else {
      console.log(
        "## Error with consultancy submission",
        JSON.stringify(response)
      );
      return response;
    }
  };

  const consultancyStatus = await tipConsultancy(consultancy_data);
  return consultancyStatus;
};

export { submitConsultancy };
