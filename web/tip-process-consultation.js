//@ts-check
import { DB } from "./db.js";
import { submitConsultancy } from "./tip-submit-consultation.js";
import { placeOrder } from "./tip-submit-order.js";

const consultancySubmitter = async (submission_uuid) => {
  console.log(`## UUID from Notification: ${submission_uuid}`);
  let collection = DB.collection("data_order");
  const data_order = await collection.findOne({
    submission_uuid: submission_uuid,
  });

  let data_orders_items = data_order?.items;

  for (const [index, item] of data_orders_items.entries()) {
    const item_uuid = item._submission_uuid;
    console.log(`##UUIDs: ${index}, ${item_uuid}, ${submission_uuid}`);
    if (item._treatment_type !== "non_pharmacy") {
      const result = await submitConsultancy(index, item_uuid, submission_uuid);
      console.log("%%% submitConsultancy response: ", result);
      if (
        data_orders_items.length === index + 1 &&
        data_order?.approval_required_item_count === 0
      ) {
        placeOrder(submission_uuid);
      }
    }
  }
  return "Identity verified";
};

const consultancyApprovalProcessor = async (submission_uuid) => {
  console.log(`## UUID from Notification: ${submission_uuid}`);
  const submitted_order_collection = DB.collection("submitted_order");
  const submitted_order = await submitted_order_collection.findOne({
    submission_uuid: submission_uuid,
  });
  if (submitted_order) {
    console.log("## Order has already been submitted");
    return;
  }

  const order_collection = DB.collection("data_order");

  //Increase approved_item_count to data_order object collection in DB
  const filter = { submission_uuid: submission_uuid };
  const update = { $inc: { approved_item_count: 1 } };
  const orderUpdateResult = await order_collection.updateOne(filter, update);
  console.log(
    `Matched ${orderUpdateResult.matchedCount} document(s) and modified ${orderUpdateResult.modifiedCount} document(s)`
  );

  const data_order = await order_collection.findOne({
    submission_uuid: submission_uuid,
  });

  if (
    data_order?.approval_required_item_count === data_order?.approved_item_count
  ) {
    placeOrder(submission_uuid);
  } else {
    console.log("## Some Items are not approved yet");
  }
  return "All consultancy approved";
};

export { consultancySubmitter, consultancyApprovalProcessor };
