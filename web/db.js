import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

let DB;

async function connectToDB(server) {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  DB = client.db("consultancy");
  server();
}

export { DB, connectToDB };
