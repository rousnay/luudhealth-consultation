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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { trophyImage } from "../assets";
import { useState, useCallback, useEffect } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export default function HomePage() {
  const fetch = useAuthenticatedFetch();

  const [treatmentId, setTreatmentId] = useState("");
  const [consultancy, setConsultancy] = useState();

  const handleTreatmentIdChange = useCallback(
    (value) => setTreatmentId(value)
  );


  // const payload = {
  //   'treatmentId': parseFloat(treatmentId),
  //   'type': 'NEW',
  // };

  const getTIPquestions = useCallback(() => {
    setConsultancy();
    (async () => {
      const url = `/api/tip/consultancy`;
      const method = "POST";
      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'treatmentId': parseFloat(treatmentId),
          'type': 'NEW',
        }),
      });
      if (response.status === 200) {
        const fullResponse = await response.json();
        setConsultancy(fullResponse?.data[0]);
      } else {
        setConsultancy("Something went wrong with TIP API");
      }
    })();
    return { status: "success" };
  }, [treatmentId, consultancy, setConsultancy]);

  useEffect(() => {
    console.log(treatmentId);
    console.log(consultancy);
  }, [treatmentId,consultancy]);

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
                    App to display dynamic form in product page based on the
                    chosen medication.
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
          <Form onSubmit={getTIPquestions}>
            <FormLayout>
              <TextField
                value={treatmentId}
                onChange={handleTreatmentIdChange}
                label="Set Treatment ID"
                type="text"
                autoComplete="text"
                helpText={
                  <span>
                    Please input your treatment ID to get the consultancy questionnaire
                  </span>
                }
              />
              <Button submit>Get Questions</Button>
            </FormLayout>
          </Form>
        </Layout.Section>

        {consultancy &&
          <Layout.Section>

            <TextContainer>
                <Heading>{consultancy?.title}</Heading>
                <p style={{ marginBottom: "30px", paddingBottom: "30px", borderBottom: "1px solid #bbb" }}>
                {consultancy?.description} <br/>
                Treatment ID: {treatmentId}, Consultancy ID: {consultancy?.id}
                </p>
            </TextContainer>

            {consultancy?.questions.map((question, index) => {
              return (
                <div style={{ marginBottom: "30px" }} key={index}>
                  <span dangerouslySetInnerHTML={{__html: question?.question_text}}></span>
                  <TextField label={`Question Type: ${question?.question_type}`} autoComplete="off" />
                </div>
                )
            })}
          </Layout.Section>
          }

      </Layout>
    </Page>
  );
}
