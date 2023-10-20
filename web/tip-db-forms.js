//@ts-check
import { DB } from "./db.js";

//Webhook: User info to DB

const conditionSubmit = async (formConditionResponse) => {
  console.log("## Form: Condition -> Submit");
  // const order_id = webhookResponse?.id;
  if (formConditionResponse) {
    const data_condition = DB.collection("data_condition");

    const result = await data_condition.insertOne({
      submitted_at: formConditionResponse?.submitted_at,
      submission_uuid: formConditionResponse?.submission_uuid,
      treatment_type: formConditionResponse?.treatment_type,
      condition_id: formConditionResponse?.condition_id,
      treatment_id: formConditionResponse?.treatment_id,
      condition: formConditionResponse?.consultancy,
    });

    console.log(
      `## A document was inserted with the _id: ${result.insertedId}`
    );
  } else {
    console.log("## There is error in Payload!");
  }
};

const consultancySubmit = async (formConsultancyResponse) => {
  console.log("## Form: Consultancy -> Submit");
  // const order_id = webhookResponse?.id;
  if (formConsultancyResponse) {
    const data_consultancy = DB.collection("data_consultancy");

    if (formConsultancyResponse.treatment_form_index === 1) {
      const result = await data_consultancy.insertOne({
        submitted_at: formConsultancyResponse?.submitted_at,
        submission_uuid: formConsultancyResponse?.submission_uuid,
        treatment_type: formConsultancyResponse?.treatment_type,
        condition_id: formConsultancyResponse?.condition_id,
        treatment_id: formConsultancyResponse?.treatment_id,
        treatment_form_index: formConsultancyResponse?.treatment_form_index,
        has_another_treatment_form:
          formConsultancyResponse?.has_another_treatment_form,
        consultancy: formConsultancyResponse?.consultancy,
      });
      console.log(
        `## A document was inserted with the _id: ${result.insertedId}`
      );
    } else {
      const orderUpdateResult = await data_consultancy.updateOne(
        { submission_uuid: formConsultancyResponse?.submission_uuid },
        {
          $push: {
            consultancy: { $each: formConsultancyResponse?.consultancy },
          },
        }
      );
      console.log(
        `## Matched ${orderUpdateResult.matchedCount} document(s) and modified ${orderUpdateResult.modifiedCount} document(s)`
      );
    }
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
      treatment_type: formMedicalResponse?.treatment_type,
      medical: formMedicalResponse?.medical,
    });
    console.log(
      `## A document was inserted with the _id: ${result.insertedId}`
    );
  } else {
    console.log("## There is error in Payload!");
  }
};

export { conditionSubmit, consultancySubmit, medicalSubmit };
