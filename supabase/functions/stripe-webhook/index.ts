import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@13.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,x-client-info,apikey,content-type",
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
    const body = await req.text();
    // Get the Stripe signature from the headers
    const signature = req.headers.get("stripe-signature");
    console.log("DEBUG: Webhook received, verifying signature...");

    // Initialize Stripe with your secret key
    const stripe = new Stripe(
      Deno.env.get("STRIPE_SECRET_KEY") || "",
      { apiVersion: "2023-10-16" }
    );

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
      console.log(`✅ Webhook event received: ${event.type}`);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialize Supabase client with admin rights (service_role key)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get the user ID from client_reference_id
      const userId = session.client_reference_id;
      if (!userId) {
        console.error("❌ No user ID found in checkout session client_reference_id");
        return new Response(
          JSON.stringify({ error: "User ID missing from session" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
      
      console.log(`🎯 Checkout completed for user: ${userId}`);
      console.log(`💳 Session details - ID: ${session.id}, Customer: ${session.customer}, Amount: ${session.amount_total}`);
      
      // Store Stripe customer and subscription info
      let stripeCustomerId = session.customer as string;
      let stripeSubscriptionId = session.subscription as string;
      
      // Update user's profile to set is_premium=true and store Stripe info
      const { data, error } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId
        })
        .eq("id", userId)
        .select();
        
      if (error) {
        console.error(`❌ Failed to update premium status for user ${userId}:`, error.message);
        
        // Try to create the profile if it doesn't exist
        console.log(`🔄 Attempting to create profile for user ${userId}`);
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([{
            id: userId,
            is_premium: true,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            free_poems_generated: 0
          }])
          .select();
          
        if (insertError) {
          console.error(`❌ Failed to create profile for user ${userId}:`, insertError.message);
          return new Response(
            JSON.stringify({ error: insertError.message }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            }
          );
        }
        
        console.log(`✅ Profile created successfully for user ${userId}:`, newProfile);
        return new Response(
          JSON.stringify({
            received: true,
            created: true,
            userId: userId,
            sessionId: session.id,
            profile: newProfile[0]
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      console.log(`✅ User ${userId} premium status updated successfully`);
      console.log("📊 Updated profile data:", data);
      
      return new Response(
        JSON.stringify({
          received: true,
          updated: true,
          userId: userId,
          sessionId: session.id,
          profile: data[0]
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    // Handle subscription cancellation
    else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`🚫 Subscription cancelled: ${subscription.id}`);
      
      // Find user by stripe_subscription_id and revoke premium access
      const { data, error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          stripe_subscription_id: null
        })
        .eq("stripe_subscription_id", subscription.id)
        .select();
        
      if (error) {
        console.error(`❌ Failed to revoke premium for subscription ${subscription.id}:`, error.message);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
      
      console.log(`✅ Premium access revoked for subscription ${subscription.id}`);
      return new Response(
        JSON.stringify({
          received: true,
          revoked: true,
          subscriptionId: subscription.id,
          affectedUsers: data?.length || 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // For other event types, just acknowledge receipt
    console.log(`📝 Received event type ${event.type}, acknowledging without action`);
    return new Response(
      JSON.stringify({ received: true, eventType: event.type }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error(`💥 FATAL ERROR: Unhandled error in webhook: ${err.message}`);
    console.error("Error stack:", err.stack);
    return new Response(
      JSON.stringify({ error: `Server Error: ${err.message}` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

console.log("🚀 stripe-webhook Edge Function initialized and ready to receive events");