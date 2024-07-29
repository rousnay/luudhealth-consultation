import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
// const MONGODB_URI =
//   process.env.MONGODB_URI ||
//   "mongodb+srv://db_user_ross:db_pass_I7c5uQqSvZCHwQrv@consultationdata.inq4i7d.mongodb.net/?retryWrites=true&w=majority";
//   const MONGODB_URI = process.env.MONGODB_URI;
// console.log("connecting to MongoDB at", MONGODB_URI);

let DB;

async function connectToDB(server) {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  DB = client.db("consultancy");
  server();
}

export { DB, connectToDB };
