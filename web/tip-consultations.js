function submitConsultancy(data_consultancy, data_medical, data_order) {
  const tipConsultancy = async (consultancyPayload) => {
    const url = `/api/tip/consultations`;
    const method = "POST";
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(consultancyPayload),
    });
    if (response.status === 200) {
      const fullResponse = await response.json();
      console.log(await fullResponse);
    } else {
      console.log("error with consultancy submission");
    }
  };

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
  console.log(form_data);
  tipConsultancy(form_data);
  // console.log(JSON.stringify(form_data));
}

export { submitConsultancy };
