// Placeholder Edge Function for ai-chat
// This is created to satisfy deployment requirements but is not used in the current implementation

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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

  // This is a placeholder function
  return new Response(JSON.stringify({ 
    message: "AI Chat function placeholder - not implemented yet",
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});

console.log("DEBUG: ai-chat Edge Function initialized (placeholder)");