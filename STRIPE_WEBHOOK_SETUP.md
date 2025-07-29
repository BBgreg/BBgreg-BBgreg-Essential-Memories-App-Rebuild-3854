# 🚨 CRITICAL: Stripe Webhook Setup Instructions

## Issue Resolved
The problem was that customers were paying successfully, but their premium status wasn't being updated in Supabase. This happened because:
1. The webhook wasn't properly configured
2. The user ID mapping wasn't working correctly
3. Profile creation/updates were failing

## What Was Fixed

### 1. Updated Stripe Webhook Handler
- ✅ Better error handling and logging
- ✅ Automatic profile creation if doesn't exist
- ✅ Proper user ID mapping from `client_reference_id`
- ✅ Stores Stripe customer and subscription IDs
- ✅ Handles subscription cancellations

### 2. Updated Checkout Session Creation
- ✅ Passes user email to Stripe
- ✅ Includes metadata for better tracking
- ✅ Uses correct price ID from your data

### 3. Database Schema Updates
- ✅ Ensures all required columns exist
- ✅ Proper RLS policies
- ✅ Indexes for performance

## IMMEDIATE ACTIONS REQUIRED

### Step 1: Deploy Updated Edge Functions
```bash
supabase functions deploy stripe-webhook --project-ref oeccgchvvewljcrfayrg
supabase functions deploy create-checkout-session --project-ref oeccgchvvewljcrfayrg
```

### Step 2: Run Database Migration
The migration will automatically run, but you can verify it worked by checking your profiles table structure.

### Step 3: Configure Stripe Webhook
**CRITICAL**: You must set up the webhook in Stripe Dashboard:

1. **Go to**: Stripe Dashboard > Developers > Webhooks
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://oeccgchvvewljcrfayrg.supabase.co/functions/v1/stripe-webhook`
4. **Events to send**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.deleted`
5. **Copy the webhook signing secret** (starts with `whsec_`)

### Step 4: Update Supabase Secrets
**Go to**: Supabase Dashboard > Project Settings > Edge Functions > Secrets

**Add/Update these secrets**:
```
STRIPE_SECRET_KEY: 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
STRIPE_WEBHOOK_SECRET: [Your webhook signing secret from Step 3]
SUPABASE_URL: https://oeccgchvvewljcrfayrg.supabase.co
SUPABASE_SERVICE_ROLE_KEY: [Get this from Project Settings > API > service_role key]
```

## Testing Checklist

### Test the Complete Flow:
1. ✅ User clicks "Subscribe Now" on pricing page
2. ✅ Checkout session creates successfully
3. ✅ User completes payment in Stripe
4. ✅ Webhook receives `checkout.session.completed` event
5. ✅ User's `is_premium` status updates to `true`
6. ✅ User gains access to premium features

### Verify in Supabase:
1. Check the `profiles` table
2. Find the user who just subscribed
3. Confirm `is_premium = true`
4. Confirm `stripe_customer_id` and `stripe_subscription_id` are populated

## Debugging

### Check Edge Function Logs:
1. Supabase Dashboard > Edge Functions > stripe-webhook
2. Look for logs showing successful user updates
3. Should see: "✅ User {userId} premium status updated successfully"

### Check Stripe Webhook Events:
1. Stripe Dashboard > Developers > Webhooks
2. Click on your webhook endpoint
3. Check recent events - should show successful 200 responses

### If Still Not Working:
1. Verify all secrets are set correctly in Supabase
2. Check that the webhook URL is exactly: `https://oeccgchvvewljcrfayrg.supabase.co/functions/v1/stripe-webhook`
3. Confirm the webhook is listening for `checkout.session.completed` events
4. Check Edge Function logs for error messages

## Expected Behavior After Fix
- ✅ Customer pays → Stripe webhook fires → Premium status updates instantly
- ✅ Customer can immediately access unlimited memories
- ✅ Premium features unlock automatically
- ✅ Subscription cancellation properly revokes access

The core issue was the webhook not properly updating the database. This fix ensures that every successful payment immediately grants premium access.