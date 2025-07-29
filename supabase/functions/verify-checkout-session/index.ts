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
      status: 200,
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
    const { sessionId, userId } = await req.json();

    console.log("DEBUG: Verifying checkout session:", sessionId);
    console.log("DEBUG: For user:", userId);

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Only validate sessions that look like actual Stripe session IDs
    if (!sessionId.startsWith('cs_')) {
      console.error("ERROR: Invalid session ID format:", sessionId);
      return new Response(
        JSON.stringify({ error: "Invalid session ID format" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialize Stripe with your secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeSecretKey) {
      console.error("ERROR: STRIPE_SECRET_KEY is not set in environment variables");
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

    try {
      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      console.log("DEBUG: Session retrieved:", session.id);
      console.log("DEBUG: Session status:", session.status);
      console.log("DEBUG: Session client reference:", session.client_reference_id);
      
      // Verify that the session is paid and belongs to this user
      if (session.status !== 'complete') {
        console.error("ERROR: Session not complete:", session.status);
        return new Response(
          JSON.stringify({ 
            verified: false, 
            error: "Payment not complete" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
      
      // Verify the user ID if provided
      if (userId && session.client_reference_id !== userId) {
        console.error("ERROR: User ID mismatch:", userId, "vs", session.client_reference_id);
        return new Response(
          JSON.stringify({ 
            verified: false, 
            error: "User ID mismatch" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          verified: true, 
          session: {
            id: session.id,
            status: session.status,
            customer: session.customer,
            subscription: session.subscription
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error("ERROR: Stripe session verification failed:", stripeError);
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: `Invalid session: ${stripeError.message}` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (err) {
    console.error("ERROR: Failed to verify checkout session:", err.message);
    return new Response(
      JSON.stringify({ error: `Server error: ${err.message}` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

console.log("DEBUG: verify-checkout-session Edge Function initialized");