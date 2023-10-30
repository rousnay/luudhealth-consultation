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


 <input type="hidden" name="properties[Made to order]" value="Delivery Approx 4 weeks" />
 <input type="text" name="properties[myOrder]" value="Delivery Approx 4 weeks" />
 <input id="prop1" type="text" name="properties[_prop1]">
  <div class="cf-field-wrapper cf-name-field">
          <label for="cf-name" class="cf-label">Name:<span class="cf-chars">*</span></label>
          <input type="text" id="cf-name" name="properties[Name]"  placeholder="Add first name" required="true" />
  </div>
 <p class="line-item-property__field">
  <label for="prop1">Property 1</label>
  <input id="prop1" type="text" name="properties[_prop1]">
 </p>


//