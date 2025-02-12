import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Page, Layout, Text, Card } from "@shopify/polaris";
import { useQuery } from "react-query";
import { useAuthenticatedFetch } from "../../hooks";

export default function OrderDetails() {
  const { number } = useParams();
  const fetch = useAuthenticatedFetch();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery(
    ["order", number],
    async () => {
      const response = await fetch(`/api/tip/orders/${number}`);
      console.log("Fetch Response:", response);

      if (!response.ok) {
        console.log("Fetch Error:", response.statusText);
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    {
      enabled: !!number, // Ensure the query runs only if number is available
    }
  );

  useEffect(() => {
    if (order) {
      console.log("Order Data:", order);
    }
  }, [order]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!order) {
    return <div>No order data found</div>;
  }

  return (
    <Page title={`Order ${order.order_number}`}>
      <Layout>
        <Layout.Section>
          <Card title="Order Details">
            <Card.Section>
              <Text variant="bodyMd" fontWeight="bold">
                Customer Name:{" "}
              </Text>
              <Text>{order.customer_name}</Text>
            </Card.Section>
            <Card.Section>
              <Text variant="bodyMd" fontWeight="bold">
                Items:
              </Text>
              {order.items.map((item, index) => (
                <div key={index}>
                  <Text>
                    {item.title} ({item._treatment_type})
                  </Text>
                </div>
              ))}
            </Card.Section>
            <Card.Section>
              <Text variant="bodyMd" fontWeight="bold">
                Consultation Info:
              </Text>
              <Text>
                Treatment IDs:{" "}
                {order.consultation_data.submitted.map((item, index) => (
                  <span key={index}>{item.consultancy_data.treatment}, </span>
                ))}
              </Text>
              <Text>
                Require for approval: {order.approval_required_item_count}
              </Text>
              <Text>Approved by TIP: {order.approved_item_count}</Text>
            </Card.Section>

            <Card.Section>
              <Text variant="bodyMd" fontWeight="bold">
                Patient Info:
              </Text>
              <Text>Phone: {order?.patient_info?.phone}</Text>
              <Text>Gender: {order?.patient_info?.gender}</Text>
              <Text>Date of Birth: {order?.patient_info?.dob}</Text>
            </Card.Section>

            <Card.Section>
              <Text variant="bodyMd" fontWeight="bold">
                Billing Address:
              </Text>
              <Text>{order.billing_address.address1}</Text>
              <Text>
                {order.billing_address.city}, {order.billing_address.county}{" "}
                {order.billing_address.postcode}
              </Text>
            </Card.Section>
            <Card.Section>
              <Text variant="bodyMd" fontWeight="bold">
                Shipping Address:
              </Text>
              <Text>{order.shipping_address.address1}</Text>
              <Text>
                {order.shipping_address.city}, {order.shipping_address.county}{" "}
                {order.shipping_address.postcode}
              </Text>
            </Card.Section>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Identity Data" fontWeight="bold">
            <Card.Section>
              <Text variant="bodyMd" fontWeight="bold">
                Submitted:
              </Text>
              <pre>
                {JSON.stringify(order.identity_data.submitted, null, 2)}
              </pre>
            </Card.Section>
            <Card.Section>
              <Text variant="bodyMd" fontWeight="bold">
                Notification:
              </Text>
              <pre>
                {JSON.stringify(order.identity_data.notification, null, 2)}
              </pre>
            </Card.Section>
          </Card>
        </Layout.Section>

        {order.consultation_data.submitted.map((item, index) => (
          <Layout.Section key={index}>
            <Card fontWeight="bold" title={`Consultation Data: ${index + 1}`}>
              <Card.Section>
                <Text variant="bodyMd" fontWeight="bold">
                  Submitted:
                </Text>
                <pre>
                  {JSON.stringify(
                    order.consultation_data.submitted[index],
                    null,
                    2
                  )}
                </pre>
              </Card.Section>
              <Card.Section>
                <Text variant="bodyMd" fontWeight="bold">
                  Notification:
                </Text>
                <pre>
                  {JSON.stringify(
                    order.consultation_data.notification[index],
                    null,
                    2
                  )}
                </pre>
              </Card.Section>
            </Card>
          </Layout.Section>
        ))}

        {!order.consultation_data.submitted || order.consultation_data.submitted.length === 0 ? (
          order.consultation_data.consultancy_data.map((item, index) => (
            <Layout.Section>
              <Card fontWeight="bold" title={`The raw data stored in the database for the consultancy no: ${index + 1}`}>
                <Card.Section>
                  <pre>
                    {JSON.stringify(
                      order.consultation_data.consultancy_data[index],
                      null,
                      2
                    )}
                  </pre>
                </Card.Section>
              </Card>
            </Layout.Section>
          ))
        ) : null}

        {order.order_data.submitted != null && (
          <Layout.Section>
            <Card title="Order Data">
              <Card.Section>
                <Text variant="bodyMd" fontWeight="bold">
                  Submitted:
                </Text>
                <pre>{JSON.stringify(order.order_data.submitted, null, 2)}</pre>
              </Card.Section>
              <Card.Section>
                <Text variant="bodyMd" fontWeight="bold">
                  Notification:
                </Text>
                <pre>
                  {JSON.stringify(order.order_data.notification, null, 2)}
                </pre>
              </Card.Section>
            </Card>
          </Layout.Section>
        )}

        {order.order_data.submitted == null && (
          <Layout.Section>
            <Card fontWeight="bold" title="The raw order data stored in the database:">
              <Card.Section>
                <pre>
                  {order.order_data.order_info
                    ? JSON.stringify(order.order_data.order_info, null, 2)
                    : "No order data available"}
                </pre>
              </Card.Section>
            </Card>
          </Layout.Section>
        )}

      </Layout>
    </Page>
  );
}
