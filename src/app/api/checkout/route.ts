import { NextResponse } from "next/server"
import DodoPayments from "dodopayments"

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") ?? "test_mode",
})

export async function POST() {
  try {
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: "pdt_0Nfv4YZf04vRFLOfz8bXr", quantity: 1 }],
      return_url: process.env.DODO_PAYMENTS_RETURN_URL ?? "http://localhost:3000",
    })

    return NextResponse.json({ checkout_url: session.checkout_url })
  } catch (err) {
    console.error("Dodo checkout error:", err)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
