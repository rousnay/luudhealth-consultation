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

  if (!data_orders_items) {
    return {
      statusCode: 400,
      statusText: "Please try with a valid UUID",
    };
  }

  for (const [index, item] of data_orders_items.entries()) {
    const item_uuid = item._submission_uuid;
    console.log(`##UUIDs: ${index}, ${item_uuid}, ${submission_uuid}`);

    if (item._treatment_type !== "non_pharmacy") {
      const result = await submitConsultancy(index, item_uuid, submission_uuid);
      console.log("%%% submitConsultancy response: ", result);
    }

    if (
      data_orders_items.length === index + 1 &&
      data_order?.approval_required_item_count === 0
    ) {
      placeOrder(submission_uuid);
    }
  }

  return {
    statusCode: 200,
    statusText: "Identity verified",
  };
};

const consultancyApprovalProcessor = async (con_index, ord_uuid) => {
  console.log(
    `##Con index and ord UUID from notification: ${con_index}, ${ord_uuid}`
  );
  const submitted_order_collection = DB.collection("submitted_order");
  const submitted_order = await submitted_order_collection.findOne({
    order_uuid: "LUUD-ORD-" + ord_uuid,
  });
  if (submitted_order) {
    console.log("## Order has already been submitted");
    return {
      statusCode: 200,
      statusText:
        "Consultancy has been approved, but the order has been placed already",
    };
  }

  const order_collection = DB.collection("data_order");
  const filter = { submission_uuid: ord_uuid };
  const data_order = await order_collection.findOne(filter);
  let total_approved_item = data_order?.approved_item_count;

  //Increase approved_item_count to data_order object collection in DB
  if (data_order?.items[con_index]?._treatment_type === "od_medicine") {
    const update = { $inc: { approved_item_count: 1 } };
    const orderUpdateResult = await order_collection.updateOne(filter, update);
    console.log(
      `Matched ${orderUpdateResult.matchedCount} document(s) and modified ${orderUpdateResult.modifiedCount} document(s)`
    );

    total_approved_item += 1;

    if (orderUpdateResult.matchedCount === 0) {
      return {
        statusCode: 400,
        statusText: "Please try with a valid UUID",
      };
    }
  }

  if (data_order?.approval_required_item_count == 0) {
    return {
      statusCode: 200,
      statusText:
        "Consultancy has been approved, but the order should have been placed already",
    };
  }

  if (data_order?.approval_required_item_count === total_approved_item) {
    placeOrder(ord_uuid);
  } else {
    console.log("## Some Items are not approved yet");
  }

  return {
    statusCode: 200,
    statusText: "Consultancy has been approved",
  };
};

export { consultancySubmitter, consultancyApprovalProcessor };
