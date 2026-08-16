function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  apiBaseUrl: requireEnv('API_BASE_URL'),
  apiKey: requireEnv('API_KEY'),
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'orm_session',
};
