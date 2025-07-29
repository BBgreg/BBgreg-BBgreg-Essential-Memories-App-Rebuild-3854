// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@13.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }
  
  try {
    // Get the request body
    const body = await req.text();
    
    // Get the Stripe signature from the headers
    const signature = req.headers.get("stripe-signature");
    
    console.log("DEBUG: Webhook received, verifying signature...");
    
    // Initialize Stripe with your secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Verify webhook signature
    let event;
    try {
      if (!signature) {
        throw new Error("No Stripe signature found");
      }
      
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
      if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET not configured");
      }
      
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      
      console.log(`Webhook event received: ${event.type}`);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Initialize Supabase client with admin rights (service_role key)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Get the user ID from client_reference_id
      const userId = session.client_reference_id;
      
      if (!userId) {
        console.error("No user ID found in checkout session client_reference_id");
        return new Response(JSON.stringify({ error: "User ID missing" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      console.log(`DEBUG: Checkout completed for user: ${userId}`);
      console.log(`DEBUG: Session details - ID: ${session.id}, Customer: ${session.customer}, Amount: ${session.amount_total}`);
      
      // Update user's profile to set is_premium = true
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", userId)
        .select();
        
      if (error) {
        console.error(`ERROR: Failed to update premium status for user ${userId}:`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      
      console.log(`SUCCESS: User ${userId} premium status updated successfully`);
      console.log("DEBUG: Updated profile data:", data);
      
      // Return success
      return new Response(JSON.stringify({ 
        received: true, 
        updated: true,
        userId: userId,
        sessionId: session.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // For other event types, just acknowledge receipt
    console.log(`DEBUG: Received event type ${event.type}, acknowledging without action`);
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (err) {
    console.error(`FATAL ERROR: Unhandled error in webhook: ${err.message}`);
    console.error("Error stack:", err.stack);
    return new Response(JSON.stringify({ error: `Server Error: ${err.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

console.log("DEBUG: stripe-webhook Edge Function initialized and ready to receive events");

// To invoke:
// curl -i --location --request POST 'https://oeccgchvvewljcrfayrg.supabase.co/functions/v1/stripe-webhook' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'