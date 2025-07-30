import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@13.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      }
    );
  }

  try {
    // Get the request body
    const { userId, priceId, customerEmail } = await req.json();
    console.log("🎯 Creating checkout session for user:", userId);
    console.log("💰 Received price ID:", priceId);
    console.log("📧 Customer email:", customerEmail);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialize Stripe with your secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "Stripe configuration error" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Use the correct price ID from your Stripe account
    const correctPriceId = "price_1Rq48ZIa1WstuQNeqItRhuTN"; // From your provided data
    const finalPriceId = priceId || correctPriceId;
    console.log("💳 Using price ID for checkout:", finalPriceId);

    // Verify the price exists in Stripe before creating checkout session
    try {
      const price = await stripe.prices.retrieve(finalPriceId);
      console.log("✅ Price verified in Stripe:", price.id, "Amount:", price.unit_amount);
    } catch (priceError) {
      console.error("❌ Invalid price ID:", finalPriceId, priceError.message);
      return new Response(
        JSON.stringify({ error: `Invalid price ID: ${finalPriceId}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin") || "https://essentialmemoriesapp.com"}/#/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "https://essentialmemoriesapp.com"}/#/pricing`,
      client_reference_id: userId, // CRITICAL: This is how we identify the user in the webhook
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: customerEmail,
      metadata: {
        userId: userId, // Additional metadata for tracking
        source: "essential-memories-app"
      }
    });

    console.log("✅ Checkout session created successfully:", session.id);
    console.log("🔗 Checkout URL:", session.url);

    return new Response(
      JSON.stringify({
        id: session.id,
        url: session.url,
        userId: userId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("💥 Failed to create checkout session:", err.message);
    return new Response(
      JSON.stringify({ error: `Failed to create checkout session: ${err.message}` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

console.log("🚀 create-checkout-session Edge Function initialized");