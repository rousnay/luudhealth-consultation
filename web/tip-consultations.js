function submitConsultancy(data_consultancy, data_medical, data_order) {
  const form_data = {
    uuid: "IPS-C" + data_order?.line_items_uuid,
    type: "NEW",
    treatment: 6257,
    quantity: data_order?.quantity,
    patient: {
      uuid: "IPS-P" + data_order?.line_items_uuid,
      salutation: "Mr",
      firstname: data_order?.customer?.firstname,
      // "middlename": "",
      lastname: data_order?.customer?.lastname,
      phone: data_medical?.medical?.phone,
      // "email": "example@example.com",
      dob: data_medical?.medical?.dob,
      address: data_order?.billing_address,
    },
    medical: {
      gender: data_medical?.medical?.gender,
    },
    consultation: data_consultancy?.consultancy,
  };

  const tipConsultancy = async (consultancyPayload) => {
    const response = await fetch(
      `${TIP_HOST}/${TIP_API_VERSION}/partners/consultations`,
      {
        method: "post",
        headers: tip_header,
        body: JSON.stringify(consultancyPayload),
      }
    ).then((response) => response.json());

    console.log("POST: APP / Consultations");
    console.log("Body", consultancyPayload);

    if (response.status === 200) {
      const fullResponse = await response.json();
      console.log(await fullResponse);
    } else {
      console.log("error with consultancy submission");
    }
  };

  tipConsultancy(form_data);

  // return
}

export { submitConsultancy };
