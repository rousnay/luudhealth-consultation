//@ts-check
import { DB } from "./db.js";

import { identityCheck } from "./tip-submit-identity.js";
import { submitConsultancy } from "./tip-submit-consultation.js";
import { placeOrder } from "./tip-submit-order.js";
// import { placeOrderNonPres } from "./tip-submit-order-nonpres.js";

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

const dataAggregate = async (submission_uuid) => {
  console.log("## DB: data_aggregated");
  const data_order = await findDocumentByUuid(4, submission_uuid);

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

  //building patient info object form medical data
  let patient_info;
  for (const item of data_medical_array) {
    if (item) {
      patient_info = {
        phone: item?.medical?.phone,
        gender: item?.medical?.gender,
        dob: item?.medical?.dob,
      };
      break;
    }
  }

  // Get the count of od_medicine
  const filteredOrderObjects = data_orders_items.filter(
    (obj) => obj._treatment_type === "od_medicine"
  );
  const approval_required_item_count = filteredOrderObjects.length;

  //Inserting patient info object into data_order Object
  data_order.patient_info = patient_info;
  data_order.approval_required_item_count = approval_required_item_count;

  //Inserting patient info object into data_order collection in DB
  const order_collection = DB.collection("data_order");
  const filter = { submission_uuid: submission_uuid };
  const update = {
    $set: {
      patient_info: patient_info,
      approval_required_item_count: approval_required_item_count,
    },
  };
  const orderUpdateResult = await order_collection.updateOne(filter, update);
  console.log(
    `Matched ${orderUpdateResult.matchedCount} document(s) and modified ${orderUpdateResult.modifiedCount} document(s)`
  );

  //Inserting data_aggregated to DB
  const data_aggregated = DB.collection("data_aggregated");
  const result = await data_aggregated.insertOne({
    created_at: data_order?.created_at,
    submission_uuid: submission_uuid,
    order_number: data_order?.order_number,
    order_type: data_order?.order_type,
    total_items: data_order?.total_items,
    total_price: data_order?.total_price,
    order_id: data_order?.order_id,
    customer_name: data_order?.customer_name,
    customer_id: data_order?.customer_id,
    patient_info: patient_info,
    approval_required_item_count: approval_required_item_count,
    data_condition_array: data_condition_array,
    data_consultancy_array: data_consultancy_array,
    data_medical_array: data_medical_array,
    order_data: data_order,
  });

  console.log(`## A document was inserted with the _id: ${result.insertedId}`);

  // building identity info for identity check
  const identity_info = {
    uuid: "LUUD-PAT-" + submission_uuid,
    firstname: data_order?.customer?.firstname,
    lastname: data_order?.customer?.lastname,
    address: data_order?.billing_address,
    gender: patient_info?.gender,
    dob: patient_info?.dob,
  };

  // Process the flow to relevant destination
  const first_line_item = data_order?.items[0];
  const order_type = data_order?.order_type;
  const treatment_type = first_line_item._treatment_type;
  const item_uuid = first_line_item._submission_uuid;

  if (order_type === "Single" || approval_required_item_count === 0) {
    if (treatment_type === "non_pharmacy") {
      placeOrder(submission_uuid);
    } else if (treatment_type === "otc_medicine") {
      submitConsultancy(0, item_uuid, submission_uuid);
    } else {
      identityCheck(identity_info);
    }
  } else {
    identityCheck(identity_info);
  }
};

export { dataAggregate };
