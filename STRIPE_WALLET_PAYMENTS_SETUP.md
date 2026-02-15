# Stripe Apple Pay & Google Pay - Setup Guide

This guide will walk you through enabling Apple Pay and Google Pay for your BetterLady checkout.

---

## Why Enable Wallet Payments?

- **Faster checkout** - Users can pay with one click
- **Higher conversion** - Reduce cart abandonment
- **Mobile-friendly** - Perfect for phone users
- **Same fees** - No extra cost vs. regular cards

---

## Part 1: Enable Payment Methods in Stripe Dashboard

### Step 1: Log into Stripe

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Enter your email and password
3. If you have multiple accounts, select the correct one

### Step 2: Navigate to Payment Methods

1. Click **Settings** (gear icon in bottom-left corner)
2. In the left menu, click **Payment methods** (under "Payments" section)
3. You'll see a list of available payment methods

### Step 3: Enable Google Pay

1. Scroll down and find **Google Pay** in the list
2. Click the toggle switch to turn it **ON** (it will turn blue)
3. That's it! Google Pay is now enabled

**Screenshot tip**: You should see "Google Pay" with a blue toggle switch showing it's enabled.

### Step 4: Enable Apple Pay

1. Find **Apple Pay** in the same list
2. Click the toggle switch to turn it **ON** (it will turn blue)
3. Click **Save changes** button at the top of the page if prompted

**Screenshot tip**: Both Apple Pay and Google Pay should now show as enabled with blue toggle switches.

---

## Part 2: Domain Verification for Apple Pay (PRODUCTION ONLY)

**Important**: This step is ONLY needed for your live website (betterlady.cz). Skip this if you're testing in Stripe test mode.

### Why Domain Verification?

Apple requires you to prove you own the domain before allowing Apple Pay on web. This is a security measure.

### Step 1: Access Apple Pay Settings

1. In Stripe Dashboard, go to **Settings** → **Payment methods**
2. Click on **Apple Pay** in the list
3. Scroll to the "Domains" section
4. Click **Add new domain**

### Step 2: Add Your Domain

1. Enter your domain: `betterlady.cz` (without https:// or www)
2. Click **Add domain**
3. Stripe will attempt automatic verification

### Step 3: Verification Process

**Automatic Verification** (usually works):
- Stripe will try to verify automatically
- Wait 1-2 minutes
- Refresh the page
- If status shows "Verified" with a green checkmark, you're done!

**Manual Verification** (if automatic fails):

If automatic verification fails, you'll need to upload a file:

1. Stripe will show a **Download file** button
2. Click it to download the verification file (named `apple-developer-merchantid-domain-association`)
3. Upload this file to your website at this exact URL:
   ```
   https://betterlady.cz/.well-known/apple-developer-merchantid-domain-association
   ```
4. The file must be accessible without any redirects or login
5. Go back to Stripe and click **Verify domain**
6. Status should change to "Verified" with a green checkmark

**Troubleshooting**:
- Test the URL in your browser - it should download the file
- Make sure there's no `.txt` extension
- The `.well-known` folder must be publicly accessible
- If you're using a hosting provider, contact their support for help with `.well-known` folders

---

## Part 3: Testing

### In Test Mode (for developers):

**Google Pay Test**:
1. Open your checkout page in Chrome browser
2. Sign in with a Google account
3. The Stripe payment form will show a Google Pay button automatically
4. Click it to test (use Stripe test card: 4242 4242 4242 4242)

**Apple Pay Test**:
1. Open your checkout page in Safari on Mac or iPhone
2. The Stripe payment form will show an Apple Pay button automatically
3. Click it to test (Stripe provides test cards in test mode)

**Note**: Test mode doesn't require domain verification!

### In Production Mode (live):

**Google Pay**:
- Works on Chrome browser (desktop & mobile)
- User must be signed into Google with saved payment method
- Button appears automatically in Stripe payment form

**Apple Pay**:
- Works on Safari (Mac, iPhone, iPad)
- User must have a card in Apple Wallet
- Domain must be verified (see Part 2)
- Button appears automatically in Stripe payment form

---

## Part 4: How It Works

### The Magic of Stripe's Payment Element

Your code already uses Stripe's **Payment Element** which automatically:

✅ Detects user's device and browser  
✅ Shows Apple Pay on Safari if user has Apple Wallet  
✅ Shows Google Pay on Chrome if user is signed in  
✅ Falls back to regular card input if wallets aren't available  
✅ Handles all payment logic internally  

**You don't need to write any additional code!** The logos we added to the modal are just visual indicators. Stripe handles everything automatically.

### What Users Will See

**On iPhone (Safari)**:
- Two payment options in modal
- Apple Pay & Google Pay logos (left)
- Card logos (right, selected by default)
- In the payment form below, they'll see an Apple Pay button

**On Android (Chrome)**:
- Same two options in modal
- In the payment form below, they'll see a Google Pay button

**On Desktop**:
- Same options in modal
- If they have Google Pay or Apple Pay configured, buttons appear
- Otherwise, they see regular card input fields

---

## Frequently Asked Questions

### Q: Do I need to pay extra for Apple Pay and Google Pay?
**A**: No! Stripe charges the same processing fee (usually 1.9% + 4 CZK) regardless of payment method.

### Q: Will all users see these payment options?
**A**: No, only users who meet the requirements:
- **Apple Pay**: Safari on Mac/iPhone/iPad with card in Apple Wallet
- **Google Pay**: Chrome with Google account + saved payment method

### Q: What if I can't verify my domain?
**A**: Contact your hosting provider's support. They can help you:
- Create the `.well-known` folder
- Upload the verification file
- Make sure it's publicly accessible

### Q: How long does setup take?
**A**: 
- Enabling payment methods: **2 minutes**
- Domain verification (automatic): **2 minutes**
- Domain verification (manual): **10-15 minutes**

### Q: Can I test without verifying the domain?
**A**: Yes! In Stripe test mode, you can test both Apple Pay and Google Pay without domain verification.

---

## Checklist

Use this to track your progress:

- [ ] Log into Stripe Dashboard
- [ ] Go to Settings → Payment methods
- [ ] Enable Google Pay
- [ ] Enable Apple Pay
- [ ] (Production only) Add domain betterlady.cz
- [ ] (Production only) Verify domain
- [ ] Test in Chrome (Google Pay)
- [ ] Test in Safari (Apple Pay)

---

## Need Help?

**Stripe Support**:
- Help Center: [https://support.stripe.com](https://support.stripe.com)
- Chat Support: Available in Stripe Dashboard (click "?" icon)
- Email: support@stripe.com

**Documentation**:
- Apple Pay: [https://stripe.com/docs/apple-pay](https://stripe.com/docs/apple-pay)
- Google Pay: [https://stripe.com/docs/google-pay](https://stripe.com/docs/google-pay)

---

## Summary

Congratulations! Once you complete these steps:

✅ **Google Pay** will work automatically on Chrome  
✅ **Apple Pay** will work automatically on Safari  
✅ Your checkout will be faster and more mobile-friendly  
✅ Conversion rates should improve  

**Total time needed**: 5-15 minutes

**Technical complexity**: Low - Just toggle switches and verify domain

Good luck! 🚀
