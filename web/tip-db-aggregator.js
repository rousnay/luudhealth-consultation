//@ts-check
import { DB } from "./db.js";

import { identityCheck } from "./tip-submit-identity.js";
import { submitConsultancy } from "./tip-submit-consultation.js";

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
    console.log("## Not found,but:", DBCollection);
  }
  const document = await collection.findOne({ submission_uuid: uuid });

  if (document) {
    console.log("## Found document for form ID:", DBCollection);
    return document;
  } else {
    console.log("## Document not found!");
    return null;
  }
}

const dataAggregate = async (submissionUuid) => {
  console.log("## DB: data_aggregated");
  const data_order = await findDocumentByUuid(4, submissionUuid);

  let data_orders_items = data_order?.items;

  const data_condition_array = [];
  const data_consultancy_array = [];
  const data_medical_array = [];

  for (const item of data_orders_items) {
    const item_uuid = item._submission_uuid;
    const data_condition = await findDocumentByUuid(1, item_uuid);
    data_condition_array.push(data_condition);
    const data_consultancy = await findDocumentByUuid(2, item_uuid);
    data_consultancy_array.push(data_consultancy);
    const data_medical = await findDocumentByUuid(3, item_uuid);
    data_medical_array.push(data_medical);
  }

  console.log("## data_orders_items", JSON.stringify(data_orders_items));
  console.log("## data_condition_array", JSON.stringify(data_condition_array));
  console.log(
    "## data_consultancy_array",
    JSON.stringify(data_consultancy_array)
  );
  console.log("## data_medical_array", JSON.stringify(data_medical_array));

  if (submissionUuid) {
    const data_aggregated = DB.collection("data_aggregated");

    const result = await data_aggregated.insertOne({
      created_at: data_order?.created_at,
      submission_uuid: submissionUuid,
      order_number: data_order?.order_number,
      customer_name: data_order?.customer_name,
      total_price: data_order?.total_price,
      data_condition_array: data_condition_array,
      data_consultancy_array: data_consultancy_array,
      data_medical_array: data_medical_array,
      order_data: data_order,
    });

    console.log(
      `## A document was inserted with the _id: ${result.insertedId}`
    );
    // identityCheck(data_medical_array[0], data_order);

    for (const [index, item] of data_orders_items.entries()) {
      const item_uuid = item._submission_uuid;
      console.log(`##UUIDs: ${index}, ${item_uuid}, ${submissionUuid}`);
      submitConsultancy(index, item_uuid, submissionUuid);
    }
  } else {
    console.log("## There is error in Payload!");
  }
};

export { dataAggregate };
