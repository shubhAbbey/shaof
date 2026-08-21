interface StrapiEnv {
  (key: string, defaultValue?: any): any;
  int(key: string, defaultValue?: number): number;
  array(key: string, defaultValue?: string[]): string[];
  bool(key: string, defaultValue?: boolean): boolean;
}

export default ({ env }: { env: StrapiEnv }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'admin_jwt_secret_placeholder_min32chars'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'api_token_salt_placeholder_min32chars'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'transfer_token_salt_placeholder_32chars'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY', 'super_secure_encryption_key_min32chars_long'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
  },
});
