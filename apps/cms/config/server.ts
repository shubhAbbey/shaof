interface StrapiEnv {
  (key: string, defaultValue?: any): any;
  int(key: string, defaultValue?: number): number;
  array(key: string, defaultValue?: string[]): string[];
  bool(key: string, defaultValue?: boolean): boolean;
}

export default ({ env }: { env: StrapiEnv }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', [
      'app_secure_key_1_at_least_32_chars_long',
      'app_secure_key_2_at_least_32_chars_long',
    ]),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
