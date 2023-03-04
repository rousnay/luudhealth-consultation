import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  Form, FormLayout, Checkbox, TextField, Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { trophyImage } from "../assets";
import { ProductsCard } from "../components";
import {useState, useCallback, useEffect} from 'react';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const fetch = useAuthenticatedFetch();
  const [newsletter, setNewsletter] = useState(false);
  const [email, setEmail] = useState('');

  const [questions, setQuestions] = useState();

  const handleSubmit = useCallback((_event) => {
    setEmail('');
    setNewsletter(false);
  }, []);

  const handleNewsLetterChange = useCallback(
    (value) => setNewsletter(value),
    [],
  );

  // Function to collect data

const getTIPquestions = useCallback(
  () => {
    (async () => {
      const url = `/api/tip/consultancy`;
      const method = "GET";
      const response = await fetch(url, {
        method,
        // headers: { "Content-Type": "application/json" },
      });
      if (response.status == 200) {
        const QRCode = await response.text();
        setQuestions(QRCode);
      }
      else  {
        setQuestions("QRCode");
      }
    })();
    return { status: "success" };
  },
  [questions, setQuestions]
);


useEffect(() => {
  console.log(questions);
}, [questions]);

  const handleEmailChange = useCallback((value) => setEmail(value), []);

  return (
    <Page narrowWidth>
      <TitleBar title="App name" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>TIP Consultancy APP 🎉</Heading>
                  <p>
                    App to display dynamic form in product page based on the chosen medication.
                  </p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
        </Layout.Section>
        <Layout.Section>
          <Form onSubmit={getTIPquestions}>
      <FormLayout>
        <Checkbox
          label="Sign up for the Polaris newsletter"
          checked={newsletter}
          onChange={handleNewsLetterChange}
        />

        <TextField
          value={email}
          onChange={handleEmailChange}
          label="Email"
          type="email"
          autoComplete="email"
          helpText={
            <span>
              We’ll use this email address to inform you on future changes to
              Polaris.
            </span>
          }
        />
        <Button submit>Get Questions</Button>
      </FormLayout>
    </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
