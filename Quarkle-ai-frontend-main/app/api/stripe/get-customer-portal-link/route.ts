import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  const { customerId } = await request.json();

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get("referer")}`,
    });

    return new NextResponse(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse(JSON.stringify({ error: { message: err.message } }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
