export function itemsFromFormData(formData: FormData): {
  productId: string;
  quantity: number;
}[] {
  const items: { productId: string; quantity: number }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty_") || typeof value !== "string") continue;
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity <= 0) continue;
    items.push({ productId: key.slice(4), quantity });
  }

  return items;
}
