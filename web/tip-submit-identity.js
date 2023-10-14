import { DB } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

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

function identityCheck(data_medical, data_order) {
  const identity_data = {
    check_type: "GENERIC",
    patient: {
      uuid: "LUUD-PAT-" + data_order?.submission_uuid,
      firstname: data_order?.customer?.firstname,
      //middlename: data_order?.customer?.middlename,
      lastname: data_order?.customer?.lastname,
      dob: data_medical?.medical?.dob,
      gender: data_medical?.medical?.gender,
      address: data_order?.billing_address,
    },
  };
  const storeIdentityDataToDB = async (
    identityCheckPayload_data,
    response_data
  ) => {
    console.log("## Form: Medical -> Submit");
    // const order_id = webhookResponse?.id;
    if (identityCheckPayload_data) {
      const submitted_identity = DB.collection("submitted_identity");
      const result = await submitted_identity.insertOne({
        submitted_at: new Date().toJSON(),
        patient_uuid: identityCheckPayload_data?.patient?.uuid,
        identity_data: identityCheckPayload_data,
        response_data: response_data,
      });
      console.log(
        `## A document was inserted with the _id: ${result.insertedId}`
      );
    } else {
      console.log("## There is error in Payload!");
    }
  };

  const identityCheckSubmit = async (identityCheckPayload) => {
    const response = await fetch(
      `${TIP_HOST}/${TIP_API_VERSION}/partners/identity-checks`,
      {
        method: "post",
        headers: tip_header,
        body: JSON.stringify(identityCheckPayload),
      }
    ).then((response) => response.json());

    console.log(
      "## API: partners/identity-checks payload:",
      JSON.stringify(identityCheckPayload)
    );

    storeIdentityDataToDB(identityCheckPayload, response);

    if (response.status === 200) {
      console.log(
        "## API: partners/identity-checks Response:",
        JSON.stringify(response)
      );
    } else if (response.status === 201) {
      console.log("#### API: IDENTITY SUBMITTED!", JSON.stringify(response));
    } else {
      console.log("## Error with Identity submission");
      console.log(
        "## API: partners/identity-checks Response:",
        JSON.stringify(response)
      );
    }
  };

  identityCheckSubmit(identity_data);

  // return
}

export { identityCheck };
