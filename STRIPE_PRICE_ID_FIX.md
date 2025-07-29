# 🚨 CRITICAL: Stripe Price ID Fix Required

## The Problem
You were using a **Product ID** ) instead of a **Price ID** for Stripe checkout.

- ❌  = Product ID (won't work for checkout)
- ✅ ` = Price ID (correct for checkout)

## The Fix Applied
1. **Updated Edge Function**: Fixed the `create-checkout-session` function to use the correct price ID
2. **Added Price Validation**: The function now verifies the price exists in Stripe before creating checkout
3. **Better Error Handling**: More specific error messages for debugging

## IMMEDIATE ACTION REQUIRED

### Step 1: Update Supabase Secrets
Go to Supabase Dashboard > Project Settings > Edge Functions > Secrets

**Update this secret:**
```

```

### Step 2: Redeploy Edge Function
Run this command to deploy the updated function:
```bash
supabase functions deploy create-checkout-session --project-ref oeccgchvvewljcrfayrg
```

### Step 3: Verify Your Stripe Price ID
1. Go to Stripe Dashboard > Products
2. Find your Essential Memories product
3. Look at the pricing section - you should see a price ID like `price_1RpGRTIa1WstuQNeoUVVfQxv`
4. Make sure this matches what we're using in the code

## How to Find the Correct Price ID in Stripe
1. **Stripe Dashboard** > **Products**
2. **Click on your product** (Essential Memories)
3. **Look for "Pricing"** section
4. **Copy the Price ID** (starts with `price_`)

## Testing Checklist
- [ ] Update Supabase secret with correct price ID
- [ ] Redeploy Edge Function
- [ ] Test checkout flow - should work now
- [ ] Verify webhook receives payment events
- [ ] Confirm premium status updates

## Why This Happened
- Product IDs (`prod_*`) identify the product/service
- Price IDs (`price_*`) identify the specific pricing for that product
- Stripe checkout requires the price ID, not the product ID

The error "The link is no longer active" occurs when Stripe receives an invalid price ID.
