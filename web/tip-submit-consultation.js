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

  if (DBCollection == 1) {
    collection = DB.collection("data_consultancy");
  } else if (DBCollection == 2) {
    collection = DB.collection("data_medical");
  } else if (DBCollection == 3) {
    collection = DB.collection("data_order");
  } else {
    console.log("Not found,but:", DBCollection);
  }
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
const submitConsultancy = async (lineItemsUuid) => {
  const data_consultancy = await findDocumentByUuid(1, lineItemsUuid);
  const data_medical = await findDocumentByUuid(2, lineItemsUuid);
  const data_order = await findDocumentByUuid(3, lineItemsUuid);

  const consultancy_data = {
    uuid: "IPS-C" + data_order?.line_items_uuid,
    type: "NEW",
    treatment: data_medical?.treatment_id,
    quantity: data_order?.quantity,
    patient: {
      uuid: "IPS-P" + data_order?.line_items_uuid,
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

  const tipConsultancy = async (consultancyPayload) => {
    const response = await fetch(
      `${TIP_HOST}/${TIP_API_VERSION}/partners/consultations`,
      {
        method: "post",
        headers: tip_header,
        body: JSON.stringify(consultancyPayload),
      }
    ).then((response) => response.json());

    // console.log("## API: partners/consultations Body:", consultancyPayload);

    if (response.status === 200) {
      console.log("## API: partners/consultations Response:", response);
      return "OK";
    } else if (response.status === 201) {
      console.log("## consultation has been submitted!", response);
      return "consultation has been submitted!";
    } else {
      console.log("## Error with consultancy submission", response);
      return response;
    }
  };

  const consultancyStatus = await tipConsultancy(consultancy_data);
  return consultancyStatus;
};

export { submitConsultancy };
