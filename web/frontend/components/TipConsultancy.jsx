import {useState, useCallback, useEffect} from 'react';
import {
  Card,
  Heading,
  TextContainer,
  DisplayText,
  TextStyle,
} from "@shopify/polaris";

import {Form, FormLayout, Checkbox, TextField, Button} from '@shopify/polaris';

import { Toast } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function TipConsultancy() {
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(true);
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const fetch = useAuthenticatedFetch();

  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/tip/consultancy",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );





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

  const response = await fetch(
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




  const handlePopulate = async () => {
    setIsLoading(true);
    const response = await fetch("/tip/consultancy");

    if (response.status == 200) {
      await refetchProductCount();
      setToastProps({ content: "5 products created!" });
    } else {
      setIsLoading(false);
      setToastProps({
        content: "There was an error creating products",
        error: true,
      });
    }
  };

  useEffect(() => {
console.log(data);
  }, [data]);
  return (
    <>
      {toastMarkup}
      <Card
        title="Product Counter"
        sectioned
        primaryFooterAction={{
          content: "Populate 5 products",
          onAction: handlePopulate,
          loading: isLoading,
        }}
      >
        <TextContainer spacing="loose">
          <p>
            Sample products are created with a default title and price. You can
            remove them at any time.
          </p>
          <Heading element="h4">
            TOTAL PRODUCTS
            <DisplayText size="medium">
              <TextStyle variation="strong">
                {"data?.data[0]?.title"}
              </TextStyle>
            </DisplayText>
          </Heading>
        </TextContainer>
      </Card>
    </>
  );
}
