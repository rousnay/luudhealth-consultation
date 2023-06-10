function submitConsultancy(data_consultancy, data_medical, data_order) {
  const form_data = {
    uuid: "IPS-C" + data_order?.line_items_uuid,
    type: "NEW",
    treatment: 6257,
    quantity: 1,
    patient: {
      uuid: "IPS-P" + data_order?.line_items_uuid,
      salutation: "Mr",
      firstname: data_order?.customer?.firstname,
      // "middlename": "",
      lastname: data_order?.customer?.firstname,
      phone: data_medical?.medical?.lastname,
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
}

export { submitConsultancy };
