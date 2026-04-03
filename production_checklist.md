# 🚀 Production Checklist: Fixing Google Sign-In

If the "Continue with Google" button is showing an error or not responding, follow these two essential steps to authorize your domain.

## 1. Authorize Domain in Firebase Console
Firebase blocks sign-in requests from unauthorized domains for security.
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to **Authentication** > **Settings** > **Authorized Domains**.
4. Click **Add Domain** and enter: `goofychess.vercel.app`
5. Click **Add**.

## 2. Environment Variables on Vercel
Ensure your Vercel project has the correct Firebase keys.
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your **goofychess** project.
3. Go to **Settings** > **Environment Variables**.
4. Ensure the following keys are added (copy values from your local `.env` file):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## 3. Redeploy
After adding the domain and environment variables:
1. Go to the **Deployments** tab on Vercel.
2. Click the three dots on your latest deployment and select **Redeploy** (ensure "Use existing Build Cache" is unchecked if you updated env vars).

---
**Note**: I have added a "Redirect" fallback. If your browser blocks the login popup, the app will now automatically try to redirect you to the Google login page instead.
