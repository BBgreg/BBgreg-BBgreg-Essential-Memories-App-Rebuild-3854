# CRITICAL: Supabase Edge Functions Secrets Configuration

## IMMEDIATE ACTION REQUIRED

You MUST configure the following secrets in your Supabase Dashboard for the Edge Functions to work properly:

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/oeccgchvvewljcrfayrg
2. Navigate to: Project Settings > Edge Functions > Secrets

### Step 2: Add Required Secrets

Add each of these as a new secret (Name: Value format):

#### Required Secrets:
```
STRIPE_SECRET_KEY:
STRIPE_PRICE_ID: 
SUPABASE_URL:
SUPABASE_SERVICE_ROLE_KEY: [YOU NEED TO GET THIS FROM PROJECT SETTINGS > API]
STRIPE_WEBHOOK_SECRET: [YOU NEED TO GET THIS FROM STRIPE DASHBOARD AFTER CREATING WEBHOOK]
```

#### How to get missing secrets:

**SUPABASE_SERVICE_ROLE_KEY:**
1. In Supabase Dashboard: Project Settings > API
2. Copy the "service_role" key (NOT the anon key)
3. This key has admin privileges - keep it secure!

**STRIPE_WEBHOOK_SECRET:**
1. Go to Stripe Dashboard > Developers > Webhooks
2. Create new webhook endpoint with URL: https://oeccgchvvewljcrfayrg.supabase.co/functions/v1/stripe-webhook
3. Select event: `checkout.session.completed`
4. Copy the webhook signing secret (starts with `whsec_`)

### Step 3: Verify Setup
After adding all secrets:
1. Test the webhook endpoint
2. Verify Edge Functions are deployed and accessible
3. Test a complete payment flow

## DEBUGGING CHECKLIST
- [ ] All 5 secrets added to Supabase
- [ ] Edge Functions deployed successfully  
- [ ] Stripe webhook endpoint created and configured
- [ ] Test payment flow completed
- [ ] Premium status updates correctly in database

## URLs for Reference:
- Edge Functions: https://oeccgchvvewljcrfayrg.supabase.co/functions/v1/
- Webhook URL: https://oeccgchvvewljcrfayrg.supabase.co/functions/v1/stripe-webhook
- Checkout URL: https://oeccgchvvewljcrfayrg.supabase.co/functions/v1/create-checkout-session
