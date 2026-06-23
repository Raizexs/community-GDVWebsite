import { extractRows } from "./praxsuiteClient";
import { resolvePraxsuiteGatewayUrl } from "./praxsuiteGateway";
import {
  assertAllowedGatewayUrl,
  assertClientRateLimit,
  throwPraxsuiteApiError,
} from "./praxsuiteSecurity";

export async function fetchPraxsuiteTable(
  queryUrl,
  tableName,
  ref,
  apiKey,
  { skipRateLimit = false } = {},
) {
  if (!skipRateLimit) {
    assertClientRateLimit("query");
  }

  const gatewayUrl = resolvePraxsuiteGatewayUrl(queryUrl);
  assertAllowedGatewayUrl(gatewayUrl);

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
    throwPraxsuiteApiError("fetchPraxsuiteTable", response.status, errorText);
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (data && typeof data === "object" && data.error) {
    throwPraxsuiteApiError(
      "fetchPraxsuiteTable",
      response.status,
      String(data.error),
    );
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
  assertClientRateLimit("contact");

  const table = "CONTACT";
  const gatewayUrl = resolvePraxsuiteGatewayUrl(queryUrl);
  assertAllowedGatewayUrl(gatewayUrl);
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
    throwPraxsuiteApiError(
      "insertPraxsuiteContact",
      response.status,
      errorText,
    );
  }

  return response.json().catch(() => ({}));
}
