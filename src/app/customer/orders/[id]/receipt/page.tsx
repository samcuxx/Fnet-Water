import React from "react";
import ReceiptViewClient from "./ReceiptViewClient";

export default async function CustomerReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <ReceiptViewClient orderId={resolvedParams.id} />;
}
