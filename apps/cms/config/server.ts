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
    keys: env.array('APP_KEYS', ['key1', 'key2']),
  },
});
