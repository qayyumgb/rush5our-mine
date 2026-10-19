/**
 * /api/cart — the browser's way to the Shopify cart. The Storefront token
 * stays here on the server; the browser holds only the cart's id.
 *
 *   GET    ?id=<cartId>                          read a cart
 *   POST   { cartId?, merchandiseId, quantity }  add a variant; makes a new
 *                                                cart if there's no id, or
 *                                                the old cart has gone
 *   PATCH  { cartId, lineId, quantity }          set a line's quantity
 *                                                (0 removes it)
 *   DELETE { cartId, lineId }                    remove a line
 *
 * RESPONSES are always JSON of the shape `CartResponse` (lib/shopify/
 * types.ts): 200 with the cart (null when Shopify no longer has it), or
 * 400 invalid · 403 another site's request · 413 too large · 422 Shopify
 * refused (its reason is passed on, e.g. out of stock) · 502 Shopify
 * failed · 503 the store isn't configured. Details go to the server log.
 */

import { isForeignOrigin, readJsonObject } from "@/lib/http";
import { ShopifyError } from "@/lib/shopify/client";
import { addLines, createCart, getCart, removeLine, updateLine, type CartMutation } from "@/lib/shopify/cart";
import type { CartResponse } from "@/lib/shopify/types";

const MAX_BODY = 2_000;
const MAX_QUANTITY = 20;

const CART_ID = /^gid:\/\/shopify\/Cart\/[\w-]+(\?key=[\w-]+)?$/;
const VARIANT_ID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;
const LINE_ID = /^gid:\/\/shopify\/CartLine\/[\w-]+(\?cart=[\w-]+)?$/;

const GENERIC_ERROR = "The cart couldn’t be updated just now. Please try again.";

function json(body: CartResponse, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function failure(error: unknown) {
  if (error instanceof ShopifyError && error.kind === "unconfigured") {
    return json({ ok: false, error: "The store isn’t open yet." }, 503);
  }
  if (!(error instanceof ShopifyError)) console.error("[cart]", error);
  return json({ ok: false, error: GENERIC_ERROR }, 502);
}

/** A mutation's outcome: Shopify's refusal as a 422, else the cart. */
function outcome(m: CartMutation) {
  if (m.errors.length) return json({ ok: false, error: m.errors[0] }, 422);
  return json({ ok: true, cart: m.cart, ...(m.warnings.length ? { notice: m.warnings[0] } : {}) });
}

const isQuantity = (n: unknown, min: number): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= min && n <= MAX_QUANTITY;

/** Origin and body checks shared by the three writes. */
async function readWrite(request: Request) {
  if (isForeignOrigin(request)) return { error: json({ ok: false, error: GENERIC_ERROR }, 403) };
  const body = await readJsonObject(request, MAX_BODY);
  if (!body.ok) {
    return {
      error:
        body.reason === "too-large"
          ? json({ ok: false, error: "That request is too large." }, 413)
          : json({ ok: false, error: "We couldn’t read that request." }, 400),
    };
  }
  return { payload: body.payload };
}

const invalid = () => json({ ok: false, error: "That cart request isn’t valid." }, 400);

/* --- GET: read ---------------------------------------------------------------- */

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!CART_ID.test(id)) return json({ ok: true, cart: null });
  try {
    return json({ ok: true, cart: await getCart(id) });
  } catch (error) {
    return failure(error);
  }
}

/* --- POST: add ------------------------------------------------------------------ */

export async function POST(request: Request) {
  const read = await readWrite(request);
  if (read.error) return read.error;
  const { cartId, merchandiseId, quantity } = read.payload;
  if (typeof merchandiseId !== "string" || !VARIANT_ID.test(merchandiseId) || !isQuantity(quantity, 1)) return invalid();
  if (cartId !== undefined && cartId !== null && (typeof cartId !== "string" || !CART_ID.test(cartId))) return invalid();

  const lines = [{ merchandiseId, quantity }];
  try {
    // A stored cart may have expired or been checked out: start a new one.
    const existing = cartId ? await getCart(cartId) : null;
    return outcome(existing ? await addLines(existing.id, lines) : await createCart(lines));
  } catch (error) {
    return failure(error);
  }
}

/* --- PATCH: quantity ----------------------------------------------------------- */

export async function PATCH(request: Request) {
  const read = await readWrite(request);
  if (read.error) return read.error;
  const { cartId, lineId, quantity } = read.payload;
  if (typeof cartId !== "string" || !CART_ID.test(cartId)) return invalid();
  if (typeof lineId !== "string" || !LINE_ID.test(lineId) || !isQuantity(quantity, 0)) return invalid();
  try {
    return outcome(quantity === 0 ? await removeLine(cartId, lineId) : await updateLine(cartId, lineId, quantity));
  } catch (error) {
    return failure(error);
  }
}

/* --- DELETE: remove -------------------------------------------------------------- */

export async function DELETE(request: Request) {
  const read = await readWrite(request);
  if (read.error) return read.error;
  const { cartId, lineId } = read.payload;
  if (typeof cartId !== "string" || !CART_ID.test(cartId)) return invalid();
  if (typeof lineId !== "string" || !LINE_ID.test(lineId)) return invalid();
  try {
    return outcome(await removeLine(cartId, lineId));
  } catch (error) {
    return failure(error);
  }
}
