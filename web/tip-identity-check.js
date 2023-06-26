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
      uuid: "IPS-P" + data_order?.line_items_uuid,
      salutation: "Mr",
      firstname: data_order?.customer?.firstname,
      middlename: "",
      lastname: data_order?.customer?.lastname,
      phone: data_medical?.medical?.phone,
      // "email": "example@example.com",
      dob: data_medical?.medical?.dob,
      gender: data_medical?.medical?.gender,
      address: data_order?.billing_address,
    },
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

    console.log("POST: APP / identityCheckPayload");
    console.log("client id:", TIP_CLIENT_ID);
    console.log("jwt:", TIP_TOKEN);
    console.log("full header", tip_header);
    console.log("identityCheckPayload:", JSON.stringify(identityCheckPayload));

    if (response.status === 200) {
      console.log(response);
    } else {
      console.log("error with Identity submission");
      console.log(response);
    }
  };

  identityCheckSubmit(identity_data);

  // return
}

export { identityCheck };