//@ts-check
import { DB } from "./db.js";
import { submitConsultancy } from "./tip-submit-consultation.js";

const consultancyHandler = async (submissionUuid) => {
  let collection = DB.collection("data_order");
  const data_order = await collection.findOne({
    submission_uuid: submissionUuid,
  });

  let data_orders_items = data_order?.items;

  for (const item of data_orders_items) {
    const item_uuid = item._submission_uuid;
    submitConsultancy(item_uuid, submissionUuid);
  }
};

export { consultancyHandler };
