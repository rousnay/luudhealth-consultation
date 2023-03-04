import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";

import { Form, FormLayout, Checkbox, TextField, Button } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
// import axios from "axios";

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxNSIsImp0aSI6IjRlZTlmMGRkMGY0NWNmNDc0ZThiNmE5NWY4NDM2NWEyMmViYzIzNDNiZTljYmYwODVhOWY4NDZiNzQwNjUzZTA0M2RlNzkzMzQ5YTQyYTc1IiwiaWF0IjoxNjc0NzMzNzEyLjE1MTM1OCwibmJmIjoxNjc0NzMzNzEyLjE1MTM2LCJleHAiOjIxNDgwODc1NzIuMDUzMDc4LCJzY29wZXMiOlsib3JkZXItY3JlYXRlIiwiY29uc3VsdGF0aW9uLWNyZWF0ZSIsImFzc2V0LWNyZWF0ZSIsInByZXNjcmlwdGlvbi1jcmVhdGUiXSwib3JnYW5pc2F0aW9uIjoiMGMwZTcxNzctMzExNi00NTZhLWFiMzItMjBiNWM2MjE1OGMzIiwidHlwZSI6Im1hY2hpbmUifQ.fPbqO5QIrOzIV5YvBUCS6gRXVx8aRkVw7AwYH-yJMsM39FiEU8nMvgiewM7iwVEnRnwH7I16_v59PAMMcVXAnVl4NmYekSnC29OWnOjPLDxJSL-u1hPf_Lu8-rMwyfGpa2wO4fYKQpeRShO4561P5d5b8rZwyFBU3rcsZQ7b4KXmgHKwyy0v0WocifufZXM5ByKK5QWUyvuzsYo069z2mKLft0fEQXVUbfrNKRTKwfGrEqIqGef2c3X3rIWppW7J5H0iTW-4sR8eAdYNMqE2GLHZDv8-z2jsWhkdihYHLiPRkLC4HX6g7K1HfoHOg7RYOL5eN-s3OHqRiDHlmcY9HK1O6zTRHCpFNaGSWU0GM1alsSlQ6QoOeg7svj1A0kAo_kY1M3O0yXe9uol4kkkt4VlUp__eOrlaA7ELCDESkhLMkuTR41L5N-mhIBQ7rk23yBd1t428TVEk5-La7cip5w3sKzaakbfqkwxfinu08w1XZHkFe0Gx_yV0ksEA54itmwqyAJGKqHWseeCASkUAPTBF1R-wgwlPUN5365IphqmPPuVGE0YYXIagPtJpkvTtoV1iFN1b5SkXYgYi2NqqWIBcmazbWfN4lB-JEhWTRSygUGacKiCCMLQd9xneDTEcbFz6UZijEccu6cqoULHlX9WjrTLufj2pOzMs6LuzEVI';
const client_id = '196c0bbc-4696-49ed-a9c4-73ac584e8571'
const body = {
  'treatmentId': 6257,
  'type': 'NEW',
};

export default function HomePage() {

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
  const getTIPquestions = async () => {

    const response = await fetch(h
    "https://api-aws.dev.theindependentpharmacy.co.uk/v1/partners/consultations/generate",
      {
        method: "post",
        headers: {
          Client: client_id,
          Authorization: "Bearer " + token,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: body,
      }
    ).then((response) => response.json());


    setQuestions(response);
  };

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
                  <Heading>Nice work on building a Shopify apps- 🎉</Heading>
                  <p>
                    Your app is ready to explore! It contains everything you
                    need to get started including the{" "}
                    <Link url="https://polaris.shopify.com/" external>
                      Polaris design system
                    </Link>
                    ,{" "}
                    <Link url="https://shopify.dev/api/admin-graphql" external>
                      Shopify Admin API
                    </Link>
                    , and{" "}
                    <Link
                      url="https://shopify.dev/apps/tools/app-bridge"
                      external
                    >
                      App Bridge
                    </Link>{" "}
                    UI library and components.
                  </p>
                  <p>
                    Ready to go? Start populating your app with some sample
                    products to view and test in your store.{" "}
                  </p>
                  <p>
                    Learn more about building out your app in{" "}
                    <Link
                      url="https://shopify.dev/apps/getting-started/add-functionality"
                      external
                    >
                      this Shopify tutorial
                    </Link>{" "}
                    📚{" "}
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
          <ProductsCard />
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
