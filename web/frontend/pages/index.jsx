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
      <TitleBar title="App name" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack wrap={false} spacing="extraTight" distribution="trailing" alignment="center">
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>TIP Consultancy APP 🎉</Heading>
                  <p>App to display dynamic form in product page based on the chosen medication.</p>
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

              <Text variant="bodyMd" fontWeight="bold">Billing Address:</Text>
              <Text>{order.billing_address.address1}, {order.billing_address.city}, {order.billing_address.county} {order.billing_address.postcode}</Text>

              <Text variant="bodyMd" fontWeight="bold">Shipping Address:</Text>
              <Text>{order.shipping_address.address1}, {order.shipping_address.city}, {order.shipping_address.county} {order.shipping_address.postcode}</Text>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}