import { DB } from "./db.js";

const identityNotification = async (notificationData) => {
  const notification_identity = DB.collection("notification_identity");
  const result = await notification_identity.insertOne({
    created_at: new Date().toJSON(),
    submission_uuid: notificationData?.data?.uuid,
    type: notificationData?.type,
    data: notificationData?.data,
  });
  console.log(
    `## identityNotification was inserted with the _id: ${result.insertedId}`
  );
};

const consultationNotification = async (notificationData) => {
  const notification_consultation = DB.collection("notification_consultation");
  const result = await notification_consultation.insertOne({
    created_at: new Date().toJSON(),
    submission_uuid: notificationData?.data?.consultation?.uuid,
    type: notificationData?.type,
    data: notificationData?.data,
  });
  console.log(
    `## consultationNotification was inserted with the _id: ${result.insertedId}`
  );
};

const orderNotification = async (notificationData) => {
  const notification_order = DB.collection("notification_order");
  const result = await notification_order.insertOne({
    created_at: new Date().toJSON(),
    submission_uuid: notificationData?.data?.uuid,
    type: notificationData?.type,
    data: notificationData?.data,
  });
  console.log(
    `## orderNotification was inserted with the _id: ${result.insertedId}`
  );
};

export { identityNotification, consultationNotification, orderNotification };
