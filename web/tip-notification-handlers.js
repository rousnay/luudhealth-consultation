//@ts-check
import { DB } from "./db.js";
import { submitConsultancy } from "./tip-submit-consultation.js";

const consultancyHandler = async (submissionUuid) => {
  let collection = DB.collection("data_order");
  const data_order = await collection.findOne({
    submission_uuid: submissionUuid,
  });

  let data_orders_items = data_order?.items;

  for (const [index, item] of data_orders_items.entries()) {
    const item_uuid = item._submission_uuid;
    console.log(`##UUIDs: ${index}, ${item_uuid}, ${submissionUuid}`);
    submitConsultancy(index, item_uuid, submissionUuid);
  }
};

export { consultancyHandler };
