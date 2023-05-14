//@ts-check
import { DB } from "./db.js";

//Webhook: User info to DB
const consultancySubmit = async (formConsultancyResponse) => {
  console.log("Form: Consultancy -> Submit");
  console.log("Body", formConsultancyResponse);
  // const order_id = webhookResponse?.id;

  if (formConsultancyResponse) {
    const consultancy_data = DB.collection("consultancy_data");

    const result = await consultancy_data.insertOne({
      consultation: formConsultancyResponse,
    });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } else {
    console.log("There is error in Payload!");
  }
};

const medicalSubmit = async (formMedicalResponse) => {
  console.log("Form: Medical -> Submit");
  console.log("Body", formMedicalResponse);
  // const order_id = webhookResponse?.id;

  if (formMedicalResponse) {
    const medical_data = DB.collection("medical_data");

    const result = await medical_data.insertOne({
      medical: formMedicalResponse,
    });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } else {
    console.log("There is error in Payload!");
  }
};

export { consultancySubmit, medicalSubmit };
