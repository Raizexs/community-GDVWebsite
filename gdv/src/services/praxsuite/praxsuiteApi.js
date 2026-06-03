import { extractRows } from "./praxsuiteClient";
import { resolvePraxsuiteGatewayUrl } from "./praxsuiteGateway";

export async function fetchPraxsuiteTable(queryUrl, tableName, ref, apiKey) {
  const gatewayUrl = resolvePraxsuiteGatewayUrl(queryUrl);
  const payload = {
    refs: { [tableName]: ref },
    query: { from: tableName, select: [] },
  };

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PraxSuite error: ${response.status} - ${errorText}`);
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return extractRows(data);
}

export async function insertPraxsuiteContact({
  queryUrl,
  ref,
  apiKey,
  name,
  email,
  subject,
  message,
}) {
  const table = "CONTACT";
  const gatewayUrl = resolvePraxsuiteGatewayUrl(queryUrl);
  const payload = {
    refs: { [table]: ref },
    mutation: {
      type: "insert",
      table,
      values: [
        {
          Name: name.substring(0, 255),
          Email: email.substring(0, 254),
          Subject: subject.substring(0, 500),
          Message: message.substring(0, 5000),
        },
      ],
      returning: ["ID", "Name", "Email", "Subject", "Message"],
    },
  };

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `PraxSuite contact error: ${response.status}`);
  }

  return response.json().catch(() => ({}));
}
