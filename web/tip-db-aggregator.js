//@ts-check
import { DB } from "./db.js";

import { identityCheck } from "./tip-submit-identity.js";

async function findDocumentByUuid(DBCollection, uuid) {
  let collection;

  if (DBCollection == 1) {
    collection = DB.collection("data_consultancy");
  } else if (DBCollection == 2) {
    collection = DB.collection("data_medical");
  } else if (DBCollection == 3) {
    collection = DB.collection("data_order");
  } else {
    console.log("## Not found,but:", DBCollection);
  }
  const document = await collection.findOne({ line_items_uuid: uuid });

  if (document) {
    console.log("## Found document for form ID:", DBCollection);
    return document;
  } else {
    console.log("## Document not found!");
    return null;
  }
}

const dataAggregate = async (lineItemsUuid) => {
  console.log("## DB: data_aggregated");

  const data_consultancy = await findDocumentByUuid(1, lineItemsUuid);
  const data_medical = await findDocumentByUuid(2, lineItemsUuid);
  const data_order = await findDocumentByUuid(3, lineItemsUuid);

  // if (order_data && data_consultancy && data_medical){

  // }

  if (lineItemsUuid) {
    const data_aggregated = DB.collection("data_aggregated");

    const result = await data_aggregated.insertOne({
      created_at: data_order?.created_at,
      line_items_uuid: lineItemsUuid,
      order_number: data_order?.order_number,
      customer_name: data_order?.customer_name,
      quantity: data_order?.quantity,
      order_data: data_order,
      data_consultancy: data_consultancy,
      data_medical: data_medical,
    });

    console.log(
      `## A document was inserted with the _id: ${result.insertedId}`
    );
    identityCheck(data_medical, data_order);
  } else {
    console.log("## There is error in Payload!");
  }
};

export { dataAggregate };
