// //@ts-check
import dotenv from "dotenv";
dotenv.config();

// Start Define TIP API Env
const TIP_HOST = process.env.TIP_HOST;
const TIP_API_VERSION = process.env.TIP_API_VERSION;
const TIP_CLIENT_ID = process.env.TIP_CLIENT_ID;
const TIP_TOKEN = process.env.TIP_TOKEN;
const tip_header = {
  Client: TIP_CLIENT_ID,
  Authorization: "Bearer " + TIP_TOKEN,
  Accept: "application/json",
  "Content-Type": "application/json",
};

import axios from "axios";

// Define the webhook URL
const webhook_identity_checks = `${TIP_HOST}/${TIP_API_VERSION}/partners/identity-checks`;

// Define the data to send
const data = {
  type: USER_ID_PASS,
  data: {
    uuid: "ARB-1291",
    check_id: 12498239,
    check_url:
      "https://idu.tracesmart.co.uk/?page=save&id=345345345453&ikey=3453453454",
  },
};

// Send the data in a POST request to the webhook URL
axios
  .post(webhook_identity_checks, data)
  .then((response) => {
    console.log("Webhook sent successfully");
  })
  .catch((error) => {
    console.error("Error sending webhook:", error);
  });
