# 🚀 Quick Fix Instructions

## The Problem
Signup is failing with error: "Failed to create account. Please try again."

## The Solution (2 Minutes)

### Step 1: Run SQL Script
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy everything from `FIX_SIGNUP_COMPLETE.sql`
4. Paste and click **RUN**

### Step 2: Test
1. Try signing up again
2. Check your email for confirmation
3. Confirm email and login

## That's It! ✅

The trigger will now automatically create user records when users sign up.

---

## What This Does
- Creates a database trigger that auto-creates user records
- Fixes RLS policy issues
- Removes manual user insertion from code
- Makes signup reliable and automatic

## Need Help?
See `APPLY_SIGNUP_FIX.md` for detailed instructions and troubleshooting.
