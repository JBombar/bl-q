# Stripe Apple Pay & Google Pay Setup Guide

This guide will help you enable Apple Pay and Google Pay payment methods in your Stripe account for the BetterLady application.

---

## Prerequisites

- Active Stripe account with payment processing enabled
- Access to Stripe Dashboard (login credentials)
- Domain verified for production use (betterlady.cz)

---

## Part 1: Enable Payment Methods in Stripe Dashboard

### Step 1: Log into Stripe Dashboard

1. Go to [https://dashboard.stripe.com/login](https://dashboard.stripe.com/login)
2. Enter your login credentials
3. Select your account (if you have multiple)

### Step 2: Navigate to Payment Methods Settings

1. In the left sidebar, click **Settings** (gear icon at bottom)
2. Under "Payments" section, click **Payment methods**
3. You'll see a list of all available payment methods

### Step 3: Enable Apple Pay

1. Find **Apple Pay** in the list
2. Click the toggle switch to **Enable** it
3. You'll see a green checkmark when enabled
4. Click **Save** at the top of the page

### Step 4: Enable Google Pay

1. Find **Google Pay** in the list
2. Click the toggle switch to **Enable** it
3. You'll see a green checkmark when enabled
4. Click **Save** at the top of the page

**Screenshot reference:** Both Apple Pay and Google Pay should show as "Enabled" with green checkmarks.

---

## Part 2: Domain Verification (Required for Apple Pay on Production)

Apple requires domain verification for web payments. This is **only needed for production** (your live domain), not for test mode.

### Step 1: Navigate to Apple Pay Settings

1. In Stripe Dashboard, go to **Settings** → **Payment methods**
2. Click on **Apple Pay** in the list
3. Click **Add domain** or **Configure domains**

### Step 2: Add Your Domain

1. Enter your domain: `betterlady.cz`
2. Click **Add domain**
3. Stripe will provide verification instructions

### Step 3: Verify Domain

**Option A: Automatic Verification (Recommended)**
- Stripe attempts to verify automatically
- This usually works if your domain is already processing payments with Stripe
- Wait 1-2 minutes and check if status changes to "Verified"

**Option B: Manual Verification (if automatic fails)**
1. Stripe will provide a verification file (e.g., `apple-developer-merchantid-domain-association`)
2. Download this file from Stripe Dashboard
3. Upload it to your web server at:
   ```
   https://betterlady.cz/.well-known/apple-developer-merchantid-domain-association
   ```
4. The file must be accessible at exactly this URL (without `.txt` or other extensions)
5. Return to Stripe Dashboard and click **Verify domain**

### Step 4: Confirm Verification

- Domain status should change to **Verified** (green checkmark)
- If verification fails, check that:
  - The file is accessible publicly (test by visiting the URL in a browser)
  - There's no redirect or authentication on the `.well-known` path
  - The file content hasn't been modified

---

## Part 3: Testing

### Test Mode (Development)

**No verification needed** - wallet payments work immediately in test mode:

1. **Test Apple Pay:**
   - Open the payment page in Safari on iPhone or Mac
   - You'll see an Apple Pay button
   - Use Stripe test cards (they work with Apple Pay test mode)

2. **Test Google Pay:**
   - Open the payment page in Chrome
   - Sign in with a Google account that has test cards
   - You'll see a Google Pay button

### Production Mode (Live Domain)

After enabling and verifying:

1. **Test Apple Pay:**
   - Visit your live site on Safari (iPhone/Mac)
   - Must have a real card added to Apple Wallet
   - Apple Pay button appears automatically

2. **Test Google Pay:**
   - Visit your live site on Chrome/Android
   - Must be signed into Google account with saved cards
   - Google Pay button appears automatically

---

## Part 4: Verify PaymentElement Configuration (Developer Task)

The code already uses Stripe's `PaymentElement`, which automatically shows wallet options. To explicitly enable them, you can optionally add this configuration:

**File:** `src/components/checkout/CheckoutModal.tsx` (around line 264)

```typescript
<Elements
  stripe={stripePromise}
  options={{
    clientSecret,
    appearance: {
      // ... existing appearance config ...
    },
    // Add this to explicitly enable wallets:
    wallets: {
      applePay: 'auto',
      googlePay: 'auto',
    },
  }}
>
```

**Note:** This is optional - `PaymentElement` enables wallets by default when available.

---

## Troubleshooting

### Apple Pay Not Showing

- ✅ Check: Domain verified in Stripe Dashboard
- ✅ Check: Using Safari browser on Apple device
- ✅ Check: User has a card in Apple Wallet
- ✅ Check: Testing on HTTPS (required for Apple Pay)
- ✅ Check: Apple Pay enabled in Stripe Dashboard

### Google Pay Not Showing

- ✅ Check: Using Chrome browser
- ✅ Check: User signed into Google account with saved payment methods
- ✅ Check: Google Pay enabled in Stripe Dashboard
- ✅ Check: Testing on HTTPS (required for Google Pay)

### Payments Failing

- Check Stripe Dashboard logs: **Developers** → **Logs**
- Look for payment intent errors
- Verify webhook endpoints are configured if using webhooks

---

## Additional Notes

### Browser/Device Compatibility

- **Apple Pay:** Safari on iOS 10.1+, macOS Sierra+
- **Google Pay:** Chrome on Android 5.0+, Chrome on desktop

### User Requirements

- **Apple Pay:** User must have at least one card in Apple Wallet
- **Google Pay:** User must be signed into Google account with saved payment method

### Automatic Display

Stripe's `PaymentElement` intelligently shows:
- Apple Pay button **only** on Apple devices with Safari
- Google Pay button **only** when user has Google Pay configured
- Regular card form as universal fallback

This means you don't need conditional logic - Stripe handles it automatically!

---

## Summary Checklist

**For you to complete in Stripe Dashboard:**

- [ ] Enable Apple Pay in Payment methods
- [ ] Enable Google Pay in Payment methods  
- [ ] Verify domain for Apple Pay (production only)
- [ ] Test on Safari (Apple Pay) and Chrome (Google Pay)

**Time required:** 5-10 minutes

**Cost:** No additional fees - Stripe charges the same processing fee for wallet payments as card payments

---

## Support

If you encounter issues:
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)
- Stripe Apple Pay docs: [https://stripe.com/docs/apple-pay](https://stripe.com/docs/apple-pay)
- Stripe Google Pay docs: [https://stripe.com/docs/google-pay](https://stripe.com/docs/google-pay)
