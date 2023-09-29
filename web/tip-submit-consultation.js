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
const submitConsultancy = async (submissionUuid) => {
  const data_condition = await findDocumentByUuid(1, submissionUuid);
  const data_consultancy = await findDocumentByUuid(2, submissionUuid);
  const data_medical = await findDocumentByUuid(3, submissionUuid);
  const data_order = await findDocumentByUuid(4, submissionUuid);

  const consultancy_data = {
    uuid: "C" + data_order?.submission_uuid,
    type: "NEW",
    treatment: data_order?.line_items[0]?.sku,
    quantity: data_order?.line_items[0]?.quantity,
    patient: {
      uuid: "P" + data_order?.submission_uuid,
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
  if (
    treatment_type === "od_medicine_generic" ||
    treatment_type === "od_medicine_treatment"
  ) {
    consultancy_data.conditionId = data_condition?.condition_id;
    consultancy_data.condition = data_condition?.condition;
  }

  const storeConsultancyDataToDB = async (
    consultancyPayload_data,
    response_data
  ) => {
    console.log("## Form: Medical -> Submit");
    // const order_id = webhookResponse?.id;
    if (consultancyPayload_data) {
      const submitted_consultation = DB.collection("submitted_consultation");
      const result = await submitted_consultation.insertOne({
        // submitted_at: submitted_at,
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
        "## consultation has been submitted!",
        JSON.stringify(response)
      );
      return "consultation has been submitted!";
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
