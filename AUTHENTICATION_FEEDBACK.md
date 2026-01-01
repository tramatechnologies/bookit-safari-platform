# Authentication Feedback & User State Detection

## Overview

The Bookit Safari platform provides comprehensive feedback for all authentication scenarios, helping users understand what happened and what to do next.

## Authentication States & Feedback

### 1. **No User Exists (Not Logged In)**

**Detection:**
- `ProtectedRoute` component checks if `user` exists
- If `user` is `null` and `loading` is `false`, user is not authenticated

**Platform Reaction:**
- **Automatic Redirect**: User is redirected to `/auth` page
- **Return Path Preserved**: Original destination is saved in `location.state.from`
- **Feedback**: Toast notification shows "Please sign in to access this page"
- **User Experience**: After sign-in, user is redirected back to their original destination

**Code Location:**
- `src/components/ProtectedRoute.tsx` (lines 20-22)

---

### 2. **User Already Registered (Signup Attempt)**

**Detection:**
- Supabase returns error when email already exists in database
- Error codes: `422` or error message contains "already exists", "already registered"

**Platform Reaction:**
- **Error Title**: "Account Already Exists"
- **Error Message**: "An account with this email already exists. Please sign in instead or reset your password if you've forgotten it."
- **Automatic Action**: After 2 seconds, form automatically switches to "Sign In" mode
- **Additional Feedback**: Toast notification confirms the switch
- **Visual Feedback**: 
  - Red border on email field
  - Error message displayed below email field
  - Toast notification with detailed message

**Code Location:**
- `src/pages/Auth.tsx` (lines 78-80, 170-176, 209-220)

**User Experience Flow:**
1. User tries to sign up with existing email
2. Error toast appears: "Account Already Exists"
3. After 2 seconds, form switches to Sign In mode
4. User can immediately enter password to sign in

---

### 3. **User Doesn't Exist (Sign In Attempt)**

**Detection:**
- Supabase returns error when email doesn't exist or password is incorrect
- Error codes: `400` or error message contains "invalid", "credentials"

**Platform Reaction:**
- **Error Title**: "Invalid Credentials"
- **Error Message**: "The email or password you entered is incorrect. Please check your credentials and try again, or reset your password if you've forgotten it."
- **Security**: Generic message prevents user enumeration attacks
- **Visual Feedback**:
  - Red border on email/password fields
  - Error message displayed below fields
  - Toast notification with helpful guidance

**Code Location:**
- `src/pages/Auth.tsx` (lines 113-125, 187-193)

**User Experience:**
- Clear error message without revealing if email exists
- Link to "Forgot password?" for password recovery
- Option to switch to "Sign up" if they don't have an account

---

### 4. **Email Not Verified**

**Detection:**
- User signs in but `email_confirmed_at` is `null`
- Error message contains "email not confirmed" or "email not verified"

**Platform Reaction:**
- **Error Title**: "Email Not Verified"
- **Error Message**: "Please verify your email address before signing in. Check your inbox for the verification link."
- **Automatic Redirect**: User is redirected to `/auth/verify-waiting`
- **Visual Feedback**: Toast notification with verification instructions

**Code Location:**
- `src/pages/Auth.tsx` (lines 127-142, 194-197)

---

### 5. **Weak Password (Signup)**

**Detection:**
- Password doesn't meet requirements (less than 8 characters)
- Error message contains "password" and "weak" or "short"

**Platform Reaction:**
- **Error Title**: "Weak Password"
- **Error Message**: "Password must be at least 8 characters long. Please choose a stronger password."
- **Visual Feedback**: 
  - Red border on password field
  - Error message below field
  - Helper text: "Password must be at least 8 characters long"

**Code Location:**
- `src/pages/Auth.tsx` (lines 177-179, 266-270)

---

### 6. **Too Many Login Attempts**

**Detection:**
- Rate limiting triggered by multiple failed attempts
- Error message contains "too many requests" or "rate limit"

**Platform Reaction:**
- **Error Title**: "Too Many Attempts"
- **Error Message**: "Too many login attempts. Please wait a few minutes before trying again."
- **Security**: Prevents brute force attacks

**Code Location:**
- `src/pages/Auth.tsx` (lines 199-202)

---

### 7. **Invalid Email Format**

**Detection:**
- Email doesn't match valid email pattern
- Zod validation fails during form validation

**Platform Reaction:**
- **Error Title**: "Invalid Email"
- **Error Message**: "Please enter a valid email address."
- **Visual Feedback**: 
  - Red border on email field
  - Error message below field
  - Real-time validation feedback

**Code Location:**
- `src/pages/Auth.tsx` (lines 180-182, 209-228)

---

### 8. **User Account Deleted**

**Detection:**
- User tries to sign in but account doesn't exist in database
- Supabase returns error code `404` or message contains "user not found", "user does not exist", "account not found"
- Session becomes invalid after account deletion

**Platform Reaction:**
- **Error Title**: "Account Not Found"
- **Error Message**: "No account found with this email address. The account may have been deleted. Please sign up for a new account if you want to continue."
- **Automatic Action**: After 2 seconds, form automatically switches to "Sign Up" mode
- **Additional Feedback**: Toast notification confirms the switch
- **Visual Feedback**: 
  - Red border on email field
  - Error message displayed below email field
  - Toast notification with detailed message

**Code Location:**
- `src/pages/Auth.tsx` (lines 127-139, 190-197, 232-242)
- `src/hooks/use-auth.tsx` (lines 28-59) - Handles `USER_DELETED` event
- `src/components/ProtectedRoute.tsx` (lines 20-24) - Redirects deleted users

**User Experience Flow:**
1. User tries to sign in with deleted account
2. Error toast appears: "Account Not Found"
3. After 2 seconds, form switches to Sign Up mode
4. User can immediately create a new account

**Session Handling:**
- If user is logged in and account gets deleted, `USER_DELETED` event is triggered
- Session is automatically cleared
- User is redirected to `/auth` page
- Protected routes detect missing user and redirect appropriately

---

## Feedback Mechanisms

### 1. **Toast Notifications**
- **Type**: Success (green), Error (red), Info (blue)
- **Duration**: 3-5 seconds
- **Location**: Top-right corner (or center on mobile)
- **Content**: Title + Description

### 2. **Inline Field Errors**
- **Location**: Below each form field
- **Style**: Red text, small font
- **Behavior**: Clears when user starts typing

### 3. **Visual Indicators**
- **Red Borders**: On fields with errors
- **Loading States**: Spinner on submit button
- **Disabled States**: Form disabled during submission

### 4. **Automatic Actions**
- **Form Switching**: Auto-switches from Sign Up to Sign In if user exists
- **Redirects**: Automatic redirects based on user state
- **Return Path**: Preserves original destination after login

---

## User Experience Flow Examples

### Example 1: New User Signup
1. User fills signup form
2. Clicks "Create Account"
3. **Success**: Toast "Account created! Please check your email..."
4. Redirected to `/auth/verify-waiting`
5. Email verification required before dashboard access

### Example 2: Existing User Tries to Sign Up
1. User fills signup form with existing email
2. Clicks "Create Account"
3. **Error**: Toast "Account Already Exists"
4. After 2 seconds, form switches to Sign In
5. User enters password and signs in

### Example 3: User Forgets Password
1. User tries to sign in with wrong password
2. **Error**: Toast "Invalid Credentials"
3. User clicks "Forgot password?"
4. Password reset email sent
5. User resets password and signs in

### Example 4: Unauthenticated User Accesses Protected Page
1. User tries to access `/dashboard` without login
2. **Redirect**: Automatically redirected to `/auth`
3. **Feedback**: Toast "Please sign in to access this page"
4. After sign-in, redirected back to `/dashboard`

---

## Security Considerations

1. **User Enumeration Prevention**: Generic error messages for invalid credentials
2. **Rate Limiting**: Prevents brute force attacks
3. **Email Verification**: Required before full access
4. **Secure Redirects**: Return paths validated and sanitized
5. **Session Management**: Automatic session refresh and validation

---

## Error Message Reference

| Scenario | Error Title | Error Message |
|----------|-------------|---------------|
| User already exists | Account Already Exists | An account with this email already exists. Please sign in instead. |
| Invalid credentials | Invalid Credentials | The email or password you entered is incorrect. Please check your credentials and try again. |
| Email not verified | Email Not Verified | Please verify your email address before signing in. Check your inbox for the verification link. |
| Weak password | Weak Password | Password must be at least 8 characters long. Please choose a stronger password. |
| Too many attempts | Too Many Attempts | Too many login attempts. Please wait a few minutes before trying again. |
| Invalid email format | Invalid Email | Please enter a valid email address. |
| Not authenticated | Sign In Required | Please sign in to access this page. |

---

## Code Files

- **Authentication Page**: `src/pages/Auth.tsx`
- **Protected Route**: `src/components/ProtectedRoute.tsx`
- **Auth Hook**: `src/hooks/use-auth.tsx`
- **Validation Schemas**: `src/lib/validations/auth.ts`

---

## Testing Scenarios

To test authentication feedback:

1. **Test User Already Exists**:
   - Try signing up with an email that's already registered
   - Verify error message and auto-switch to sign in

2. **Test Invalid Credentials**:
   - Try signing in with wrong password
   - Verify generic error message (security)

3. **Test Unauthenticated Access**:
   - Try accessing `/dashboard` without login
   - Verify redirect and return path preservation

4. **Test Email Verification**:
   - Sign up new user
   - Try signing in before verifying email
   - Verify redirect to verification waiting page

