//@ts-check
import { DB } from "./db.js";

async function findDocumentByUuid(DBCollection, uuid) {
  const collection = DB.collection("data_order");
  const document = await collection.findOne({ line_items_uuid: uuid });

  if (document) {
    console.log("Found document:", document);
    return document;
  } else {
    console.log("Document not found");
    return null;
  }
}

const dataAggregate = async (lineItemsUuid) => {
  console.log("DB: data_aggregated");

  const order_data = await findDocumentByUuid("order_data", lineItemsUuid);
  const data_consultancy = await findDocumentByUuid(
    "data_consultancy",
    lineItemsUuid
  );
  const data_medical = await findDocumentByUuid("data_medical", lineItemsUuid);

  // if (order_data && data_consultancy && data_medical){

  // }

  if (lineItemsUuid) {
    const data_aggregated = DB.collection("data_aggregated");

    const result = await data_aggregated.insertOne({
      order_data: order_data,
      data_consultancy: data_consultancy,
      data_medical: data_medical,
    });

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } else {
    console.log("There is error in Payload!");
  }
};

export { dataAggregate };
