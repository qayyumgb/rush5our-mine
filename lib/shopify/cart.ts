/**
 * SHOPIFY — the cart. Server-only; called from app/api/cart, so the
 * Storefront token never reaches the browser.
 *
 * Carts live at Shopify. The browser keeps only the cart's id (in
 * localStorage) and asks the route for the cart by it. Shopify forgets a
 * cart once it has been checked out, or after it has sat idle for a while;
 * reading it then gives null, and the browser starts afresh.
 */

import "server-only";
import { shopifyFetch } from "./client";
import type { CartLine, ShopCart } from "./types";

const CART = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            selectedOptions { name value }
            price { amount currencyCode }
            image { url altText width height }
            product { handle title }
          }
        }
      }
    }
  }
`;

const RESULT = /* GraphQL */ `
  cart { ...CartFields }
  userErrors { field message }
  warnings { code message }
`;

const GET = /* GraphQL */ `
  query Cart($id: ID!) { cart(id: $id) { ...CartFields } }
  ${CART}
`;

const CREATE = /* GraphQL */ `
  mutation Create($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { ${RESULT} } }
  ${CART}
`;

const ADD = /* GraphQL */ `
  mutation Add($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { ${RESULT} } }
  ${CART}
`;

const UPDATE = /* GraphQL */ `
  mutation Update($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { ${RESULT} } }
  ${CART}
`;

const REMOVE = /* GraphQL */ `
  mutation Remove($id: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $lineIds) { ${RESULT} } }
  ${CART}
`;

/* --- raw shapes --------------------------------------------------------------- */

interface RawLine {
  id: string;
  quantity: number;
  cost: { totalAmount: CartLine["total"] };
  merchandise: CartLine["merchandise"];
}

interface RawCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: ShopCart["subtotal"] };
  lines: { nodes: RawLine[] };
}

interface RawResult {
  cart: RawCart | null;
  userErrors: { field: string[] | null; message: string }[];
  warnings: { code: string; message: string }[];
}

function toCart(c: RawCart): ShopCart {
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity,
    subtotal: c.cost.subtotalAmount,
    lines: c.lines.nodes
      // A line whose product was deleted comes back without merchandise.
      .filter((l) => l.merchandise?.id)
      .map((l) => ({ id: l.id, quantity: l.quantity, total: l.cost.totalAmount, merchandise: l.merchandise })),
  };
}

export interface CartMutation {
  cart: ShopCart | null;
  /** Why Shopify refused, in its words; empty when it didn't. */
  errors: string[];
  /** What Shopify adjusted on its own, e.g. a quantity capped at the stock. */
  warnings: string[];
}

function toMutation(r: RawResult): CartMutation {
  return {
    cart: r.cart ? toCart(r.cart) : null,
    errors: r.userErrors.map((e) => e.message),
    warnings: r.warnings.map((w) => w.message),
  };
}

/* --- calls ---------------------------------------------------------------------- */

export interface LineInput {
  merchandiseId: string;
  quantity: number;
}

export async function getCart(id: string): Promise<ShopCart | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>(GET, { variables: { id }, cache: "none" });
  return data.cart ? toCart(data.cart) : null;
}

export async function createCart(lines: LineInput[]): Promise<CartMutation> {
  const data = await shopifyFetch<{ cartCreate: RawResult }>(CREATE, { variables: { lines }, cache: "none" });
  return toMutation(data.cartCreate);
}

export async function addLines(id: string, lines: LineInput[]): Promise<CartMutation> {
  const data = await shopifyFetch<{ cartLinesAdd: RawResult }>(ADD, { variables: { id, lines }, cache: "none" });
  return toMutation(data.cartLinesAdd);
}

export async function updateLine(id: string, lineId: string, quantity: number): Promise<CartMutation> {
  const data = await shopifyFetch<{ cartLinesUpdate: RawResult }>(UPDATE, {
    variables: { id, lines: [{ id: lineId, quantity }] },
    cache: "none",
  });
  return toMutation(data.cartLinesUpdate);
}

export async function removeLine(id: string, lineId: string): Promise<CartMutation> {
  const data = await shopifyFetch<{ cartLinesRemove: RawResult }>(REMOVE, {
    variables: { id, lineIds: [lineId] },
    cache: "none",
  });
  return toMutation(data.cartLinesRemove);
}
