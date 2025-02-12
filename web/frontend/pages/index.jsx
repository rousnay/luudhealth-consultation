import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Heading,
  Form,
  FormLayout,
  TextField,
  Button,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { trophyImage } from "../assets";
import { useState } from "react";
import { useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input change
  const handleOrderIdChange = (value) => {
    setOrderId(value);
  };

  // Fetch order details
  const getOrderDetails = async () => {
    if (!orderId) {
      setError("Please enter a valid Order ID");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/tip/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page narrowWidth>
      <TitleBar title="TIP Consultancy APP" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack wrap={false} spacing="extraTight" distribution="trailing" alignment="center">
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>TIP Consultancy APP 🎉</Heading>
                  <p>Retrieve and manage order details seamlessly.</p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image source={trophyImage} alt="Nice work on building a Shopify app" width={120} />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned>
            <Form onSubmit={getOrderDetails}>
              <FormLayout>
                <TextField
                  value={orderId}
                  onChange={handleOrderIdChange}
                  label="Enter Order ID"
                  type="text"
                  autoComplete="off"
                  helpText="Input your order ID to fetch order details."
                />
                <Button submit primary loading={loading}>
                  Get Details
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>

        {error && (
          <Layout.Section>
            <Card sectioned>
              <Text variant="bodyMd" color="critical">
                {error}
              </Text>
            </Card>
          </Layout.Section>
        )}

        {order && (
          <Layout.Section>
            <Card title={`Order ${order.order_number}`} sectioned>
              <Text variant="bodyMd" fontWeight="bold">
                Customer Name: {order.customer_name}
              </Text>

              <Text variant="bodyMd" fontWeight="bold">Items:</Text>
              {order.items.map((item, index) => (
                <Text key={index}>
                  {item.title} ({item._treatment_type})
                </Text>
              ))}

              <Text variant="bodyMd" fontWeight="bold">Consultation Info:</Text>
              <Text>Treatment IDs: {order.consultation_data.submitted.map((item, index) => (
                <span key={index}>{item.consultancy_data.treatment}, </span>
              ))}</Text>
              <Text>Require for approval: {order.approval_required_item_count}</Text>
              <Text>Approved by TIP: {order.approved_item_count}</Text>

              <Text variant="bodyMd" fontWeight="bold">Patient Info:</Text>
              <Text>Phone: {order?.patient_info?.phone}</Text>
              <Text>Gender: {order?.patient_info?.gender}</Text>
              <Text>Date of Birth: {order?.patient_info?.dob}</Text>

              <Text variant="bodyMd" fontWeight="bold">Billing Address:</Text>
              <Text>{order.billing_address.address1}, {order.billing_address.city}, {order.billing_address.county} {order.billing_address.postcode}</Text>

              <Text variant="bodyMd" fontWeight="bold">Shipping Address:</Text>
              <Text>{order.shipping_address.address1}, {order.shipping_address.city}, {order.shipping_address.county} {order.shipping_address.postcode}</Text>
            </Card>

            <Card title="Identity Data">
              <Card.Section>
                <Text variant="bodyMd" fontWeight="bold">Submitted:</Text>
                <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{JSON.stringify(order.identity_data.submitted, null, 2)}</pre>
              </Card.Section>
              <Card.Section>
                <Text variant="bodyMd" fontWeight="bold">Notification:</Text>
                <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{JSON.stringify(order.identity_data.notification, null, 2)}</pre>
              </Card.Section>
            </Card>

            {order.consultation_data.submitted.map((item, index) => (
              <Card key={index} title={`Consultation Data: ${index + 1}`}>
                <Card.Section>
                  <Text variant="bodyMd" fontWeight="bold">Submitted:</Text>
                  <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{JSON.stringify(order.consultation_data.submitted[index], null, 2)}</pre>
                </Card.Section>
                <Card.Section>
                  <Text variant="bodyMd" fontWeight="bold">Notification:</Text>
                  <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{JSON.stringify(order.consultation_data.notification[index], null, 2)}</pre>
                </Card.Section>
              </Card>
            ))}

            {/* Raw Consultation Data when no submitted data exists */}
            {!order.consultation_data.submitted || order.consultation_data.submitted.length === 0 ? (
              order.consultation_data.consultancy_data.map((item, index) => (
                <Card key={index} title={`Raw Consultancy Data ${index + 1}`}>
                  <Card.Section>
                    <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{JSON.stringify(order.consultation_data.consultancy_data[index], null, 2)}</pre>
                  </Card.Section>
                </Card>
              ))
            ) : null}

            {/* Order Data Section */}
            {order.order_data.submitted != null ? (
              <Card title="Order Data">
                <Card.Section>
                  <Text variant="bodyMd" fontWeight="bold">Submitted:</Text>
                  <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{JSON.stringify(order.order_data.submitted, null, 2)}</pre>
                </Card.Section>
                <Card.Section>
                  <Text variant="bodyMd" fontWeight="bold">Notification:</Text>
                  <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{JSON.stringify(order.order_data.notification, null, 2)}</pre>
                </Card.Section>
              </Card>
            ) : (
              <Card title="Raw Order Data">
                <Card.Section>
                  <pre style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{order.order_data.order_info ? JSON.stringify(order.order_data.order_info, null, 2) : "No order data available"}</pre>
                </Card.Section>
              </Card>
            )}
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
