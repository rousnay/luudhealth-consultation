// TIPOrder.jsx
import {
  Page,
  Layout,
  Image,
  Form,
  FormLayout,
  TextField,
  Button,
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { trophyImage } from "../assets";
import React from 'react';
import { useState, useCallback, useEffect } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useNavigate } from "react-router-dom";

export default function TipOrder() {
  const [orders, setOrders] = useState([]);
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      const response = await fetch("/api/tip/orders/all");
      const data = await response.json();

      console.log(data);
      setOrders(data);
    }

    fetchOrders();
  }, [fetch]);

  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);

  const rowMarkup = orders.map(
    (
      {
        _id,
        order_number,
        customer_name,
        items,
        identity_verification,
        approved_item_count,
        approval_required_item_count,
        order_submission_status,
        order_fulfillment_status
      },
      index,
    ) => (
      <IndexTable.Row
        id={_id}
        key={_id}
        selected={selectedResources.includes(order_number)}
        position={index}
        onClick={() => navigate(`/tip-orders/${order_number}`)}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {order_number}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{customer_name}</IndexTable.Cell>
        <IndexTable.Cell>
          {items.map((item, itemIndex) => (
            <React.Fragment key={itemIndex}>
              <Text variant="bodyMd" fontWeight="bold" as="span" color="subdued">
                {item.title}
              </Text>
              &nbsp;({item._treatment_type})
              {itemIndex < items.length - 1 && <br />}
            </React.Fragment>
          ))}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {identity_verification !== "-- / --" ? (
            <Badge status={identity_verification === "Submitted / Passed" ? "success" : "warning"}>
              {identity_verification}
            </Badge>
          ) : (
            "--"
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {approval_required_item_count > 0 ? (
            <Badge status={approval_required_item_count === approved_item_count ? "success" : "warning"}>
              {approved_item_count} of {approval_required_item_count}
            </Badge>
          ) : (
            "--"
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {order_submission_status !== "--" ? (
            <Badge status={order_submission_status === "Submitted" ? "success" : "warning"} progress={order_submission_status === "Submitted" ? "complete" : "incomplete"}>
              {order_submission_status}
            </Badge>
          ) : (
            "--"
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {order_fulfillment_status !== "--" ? (
            <Badge status={order_fulfillment_status === "Fulfilled" ? "success" : "error"} progress={order_fulfillment_status === "Fulfilled" ? "complete" : "incomplete"}>
              {order_fulfillment_status}
            </Badge>
          ) : (
            order_fulfillment_status
          )}
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <LegacyCard>
      <IndexTable
        resourceName={resourceName}
        itemCount={orders.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: 'Order Number' },
          { title: 'Customer Name' },
          { title: 'List of Items' },
          { title: 'Identity Verification' },
          { title: 'Approved Consultancy' },
          { title: 'Order Status' },
          { title: 'Fulfillment Status' },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
}
