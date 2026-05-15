const { admin, isFirebaseInitialized } = require("../firebase");

const WEB_APP_URL = process.env.WEB_APP_URL || "http://localhost:8100";
const NOTIFICATION_ICON_URL = `${WEB_APP_URL}/splash-logo.png`;
const NOTIFICATION_BADGE_URL = `${WEB_APP_URL}/favicon.png`;

const chunk = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const sendPushNotificationToTokens = async ({ tokens, title, body, data = {} }) => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { sentCount: 0, invalidTokens: [], skipped: true };
  }

  if (!isFirebaseInitialized()) {
    console.warn("Skipping push send: Firebase is not initialized.");
    return { sentCount: 0, invalidTokens: [], skipped: true };
  }

  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  const tokenChunks = chunk(uniqueTokens, 500);
  let sentCount = 0;
  const invalidTokens = [];

  for (const tokenChunk of tokenChunks) {
    const message = {
      tokens: tokenChunk,
      notification: { title, body },
      data,
      webpush: {
        notification: {
          title,
          body,
          icon: NOTIFICATION_ICON_URL,
          badge: NOTIFICATION_BADGE_URL,
        },
        fcmOptions: {
          link: WEB_APP_URL,
        },
      },
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };

    const result = await admin.messaging().sendEachForMulticast(message);
    sentCount += result.successCount;

    result.responses.forEach((response, index) => {
      if (!response.success) {
        const errorCode = response.error?.code || "unknown";
        const token = tokenChunk[index];
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(token);
        }
      }
    });
  }

  return { sentCount, invalidTokens, skipped: false };
};

module.exports = {
  sendPushNotificationToTokens,
};
