const requiredEnvVars = [
  "MISTRAL_API_KEY",
  "GROQ_API_KEY",
  "PINECONE_API_KEY",
  "PINECONE_INDEX_NAME",
  "OPENROUTER_API_KEY",
  "MONGODB_URI",
  "JWT_SECRET",
] as const;

export function getRequiredEnv(name: (typeof requiredEnvVars)[number]) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string, fallback?: string) {
  return process.env[name] ?? fallback;
}

export function validateServerEnv() {
  for (const envVar of requiredEnvVars) {
    getRequiredEnv(envVar);
  }
}