//@ts-check
import { DB } from "./db.js";

//Webhook: User info to DB
const consultancySubmit = async (formConsultancyResponse) => {
  console.log("Form: Consultancy -> Submit");
  // const order_id = webhookResponse?.id;
  if (formConsultancyResponse) {
    const data_consultancy = DB.collection("data_consultancy");

    const result = await data_consultancy.insertOne({
      submitted_at: formConsultancyResponse?.submitted_at,
      line_items_uuid: formConsultancyResponse?.line_items_uuid,
      consultancy: formConsultancyResponse?.consultancy,
    });

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } else {
    console.log("There is error in Payload!");
  }
};

const medicalSubmit = async (formMedicalResponse) => {
  console.log("Form: Medical -> Submit");
  // const order_id = webhookResponse?.id;
  if (formMedicalResponse) {
    const data_medical = DB.collection("data_medical");
    const result = await data_medical.insertOne({
      submitted_at: formMedicalResponse?.submitted_at,
      line_items_uuid: formMedicalResponse?.line_items_uuid,
      medical: formMedicalResponse?.medical,
    });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } else {
    console.log("There is error in Payload!");
  }
};

export { consultancySubmit, medicalSubmit };
