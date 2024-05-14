import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  const { userEmail, plan } = await request.json();
  let priceId = "";

  if (plan === "pro") {
    priceId = "price_1OM7xyBDCbQcU5bRXQuVt1HF"; // Live Pro Plan
    // const priceId = "price_1OGh9mBDCbQcU5bRfleFzuwC"; // Test Pro Plan
    // priceId = "price_1OHPenBDCbQcU5bRz9rLiZwp"; // Live Trial Plan
  } else {
    priceId = "price_1OM7xyBDCbQcU5bRXQuVt1HF"; // Live Pro Plan
    // const priceId = "price_1OGh9mBDCbQcU5bRfleFzuwC"; // Test Pro Plan
    // priceId = "price_1OHPenBDCbQcU5bRz9rLiZwp"; // Live Trial Plan
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      discounts: [
        {
          coupon: "sGw9U8Nf", // Coupon active indefinitely
        },
      ],
      success_url: `${request.headers.get("referer")}`,
      cancel_url: `${request.headers.get("referer")}`,
      automatic_tax: { enabled: true },
      subscription_data: {
        metadata: {
          subscriptionType: plan, // Ensure this is a string
          userEmail: userEmail, // Ensure this is a string
        },
      },
    });

    return new NextResponse(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return new NextResponse(JSON.stringify({ error: { message: err.message } }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
