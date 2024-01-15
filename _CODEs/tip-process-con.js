//@ts-check
import { DB } from "./db.js";
import { submitConsultancy } from "./tip-submit-consultation.js";
import { placeOrder } from "./tip-submit-order.js";

const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
};

const STATUS_TEXT = {
  IDENTITY_VERIFIED: "Identity verified",
  CONSULTANCY_APPROVED: "Consultancy has been approved",
  CONSULTANCY_APPROVED_ORDER_PLACED: "Consultancy has been approved, and the order has been placed",
  INVALID_UUID: "Please try with a valid UUID",
  ORDER_PLACED_ALREADY: "Consultancy has been approved, but the order has been placed already",
  ITEMS_NOT_APPROVED_YET: "Some Items are not approved yet",
};

const handleDatabaseError = (errorMessage) => {
  console.error(`Database Error: ${errorMessage}`);
  return {
    statusCode: STATUS_CODES.BAD_REQUEST,
    statusText: STATUS_TEXT.INVALID_UUID,
  };
};

const consultancySubmitter = async (submission_uuid) => {
  try {
    console.log(`## UUID from Notification: ${submission_uuid}`);
    const orderCollection = DB.collection("data_order");
    const dataOrder = await orderCollection.findOne({ submission_uuid });

    if (!dataOrder) {
      return handleDatabaseError("Data Order not found");
    }

    const dataOrderItems = dataOrder.items || [];

    for (const [index, item] of dataOrderItems.entries()) {
      const item_uuid = item._submission_uuid;
      console.log(`##UUIDs: ${index}, ${item_uuid}, ${submission_uuid}`);

      if (item._treatment_type !== "non_pharmacy") {
        const result = await submitConsultancy(index, item_uuid, submission_uuid);
        console.log("%%% submitConsultancy response: ", result);
      }

      if (dataOrderItems.length === index + 1 && dataOrder.approval_required_item_count === 0) {
        placeOrder(submission_uuid);
      }
    }

    return {
      statusCode: STATUS_CODES.OK,
      statusText: STATUS_TEXT.IDENTITY_VERIFIED,
    };
  } catch (error) {
    return handleDatabaseError(error.message);
  }
};

const consultancyApprovalProcessor = async (con_index, ord_uuid) => {
  try {
    console.log(`##Con index and ord UUID from notification: ${con_index}, ${ord_uuid}`);
    const submittedOrderCollection = DB.collection("submitted_order");
    const submittedOrder = await submittedOrderCollection.findOne({ order_uuid: "LUUD-ORD-" + ord_uuid });

    if (submittedOrder) {
      console.log("## Order has already been submitted");
      return {
        statusCode: STATUS_CODES.OK,
        statusText: STATUS_TEXT.ORDER_PLACED_ALREADY,
      };
    }

    const orderCollection = DB.collection("data_order");
    const filter = { submission_uuid: ord_uuid };
    const dataOrder = await orderCollection.findOne(filter);

    if (!dataOrder) {
      return handleDatabaseError("Data Order not found");
    }

    let totalApprovedItem = dataOrder?.approved_item_count || 0;

    if (dataOrder.items[con_index]._treatment_type === "od_medicine") {
      const update = { $inc: { approved_item_count: 1 } };
      const orderUpdateResult = await orderCollection.updateOne(filter, update);
      console.log(
        `Matched ${orderUpdateResult.matchedCount} document(s) and modified ${orderUpdateResult.modifiedCount} document(s`
        );

      totalApprovedItem += 1;

      if (orderUpdateResult.matchedCount === 0) {
        return handleDatabaseError("Order Update Failed");
      }
    }

    if (dataOrder.approval_required_item_count === 0) {
      return {
        statusCode: STATUS_CODES.OK,
        statusText: STATUS_TEXT.CONSULTANCY_APPROVED_ORDER_PLACED,
      };
    }

    if (dataOrder.approval_required_item_count === totalApprovedItem) {
      placeOrder(ord_uuid);
    } else {
      console.log(STATUS_TEXT.ITEMS_NOT_APPROVED_YET);
    }

    return {
      statusCode: STATUS_CODES.OK,
      statusText: STATUS_TEXT.CONSULTANCY_APPROVED,
    };
  } catch (error) {
    return handleDatabaseError(error.message);
  }
};

export { consultancySubmitter, consultancyApprovalProcessor };
