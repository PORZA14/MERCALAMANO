import dotenv from 'dotenv';

// Vercel injects env vars at runtime; locally we read the mirrored v0/Vercel env files.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: ['.env.development.local', '.env.local', '.env'], quiet: true });
}
