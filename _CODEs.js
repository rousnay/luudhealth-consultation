import axios from "axios";

// Define the webhook URL
const webhookUrl = "https://example.com/webhook";

// Define the data to send
const data = {
  message: "Hello, world!",
  timestamp: new Date().getTime(),
};

// Send the data in a POST request to the webhook URL
axios
  .post(webhookUrl, data)
  .then((response) => {
    console.log("Webhook sent successfully");
  })
  .catch((error) => {
    console.error("Error sending webhook:", error);
  });

//JSON

let created_response = {
  "message": "New created",
  "status": 201,
  "data": {
      "uuid": "IPS-C23445"
  }
}
