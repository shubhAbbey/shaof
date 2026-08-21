interface StrapiEnv {
  (key: string, defaultValue?: any): any;
  int(key: string, defaultValue?: number): number;
  array(key: string, defaultValue?: string[]): string[];
  bool(key: string, defaultValue?: boolean): boolean;
}

export default ({ env }: { env: StrapiEnv }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'admin_jwt_secret_placeholder_12345'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'api_token_salt_placeholder_12345'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'transfer_token_salt_placeholder_12345'),
    },
  },
});
