//@ts-check
import { DB } from "./db.js";

//Webhook: User info to DB
const consultancySubmit = async (formConsultancyResponse) => {
  console.log("## Form: Consultancy -> Submit");
  // const order_id = webhookResponse?.id;
  if (formConsultancyResponse) {
    const data_consultancy = DB.collection("data_consultancy");

    const result = await data_consultancy.insertOne({
      submitted_at: formConsultancyResponse?.submitted_at,
      submission_uuid: formConsultancyResponse?.submission_uuid,
      treatment_id: formConsultancyResponse?.treatment_id,
      consultancy: formConsultancyResponse?.consultancy,
    });

    console.log(
      `## A document was inserted with the _id: ${result.insertedId}`
    );
  } else {
    console.log("## There is error in Payload!");
  }
};

const medicalSubmit = async (formMedicalResponse) => {
  console.log("## Form: Medical -> Submit");
  // const order_id = webhookResponse?.id;
  if (formMedicalResponse) {
    const data_medical = DB.collection("data_medical");
    const result = await data_medical.insertOne({
      submitted_at: formMedicalResponse?.submitted_at,
      submission_uuid: formMedicalResponse?.submission_uuid,
      treatment_id: formMedicalResponse?.treatment_id,
      medical: formMedicalResponse?.medical,
    });
    console.log(
      `## A document was inserted with the _id: ${result.insertedId}`
    );
  } else {
    console.log("## There is error in Payload!");
  }
};

export { consultancySubmit, medicalSubmit };
