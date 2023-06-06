//@ts-check
import { DB } from "./db.js";

async function findDocumentByUuid(DBCollection, uuid) {
  let collection;

  if (DBCollection == 1) {
    collection = DB.collection("data_consultancy");
  } else if (DBCollection == 2) {
    collection = DB.collection("data_medical");
  } else if (DBCollection == 3) {
    collection = DB.collection("data_order");
  } else {
    console.log("Not found,but:", DBCollection);
  }
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

  const data_consultancy = await findDocumentByUuid(1, lineItemsUuid);
  const data_medical = await findDocumentByUuid(2, lineItemsUuid);
  const data_order = await findDocumentByUuid(3, lineItemsUuid);

  // if (order_data && data_consultancy && data_medical){

  // }

  if (lineItemsUuid) {
    const data_aggregated = DB.collection("data_aggregated");

    const result = await data_aggregated.insertOne({
      order_data: data_order,
      data_consultancy: data_consultancy,
      data_medical: data_medical,
    });

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } else {
    console.log("There is error in Payload!");
  }
};

export { dataAggregate };
