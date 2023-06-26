// const apiKey = 'YOUR_API_KEY';
// const shop = 'your-shop-name.myshopify.com';
// const orderId = '123456789'; // Replace with the actual order ID

// const endpoint = `https://${shop}/admin/api/2021-07/orders/${orderId}/fulfillments.json`;

// const payload = {
//   fulfillment: {
//     location_id: 123456789, // Replace with the actual location ID
//     tracking_number: '1234567890', // Replace with the actual tracking number
//     tracking_company: 'Shipping Company', // Replace with the actual shipping company
//     line_items: [
//       {
//         id: 123456789, // Replace with the actual line item ID
//       }
//     ]
//   }
// };

// fetch(endpoint, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'X-Shopify-Access-Token': apiKey
//   },
//   body: JSON.stringify(payload)
// })
//   .then(response => response.json())
//   .then(data => {
//     console.log('Order fulfilled:', data);
//   })
//   .catch(error => {
//     console.error('Error fulfilling order:', error);
//   });
