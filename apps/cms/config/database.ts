interface StrapiEnv {
  (key: string, defaultValue?: any): any;
  int(key: string, defaultValue?: number): number;
  array(key: string, defaultValue?: string[]): string[];
  bool(key: string, defaultValue?: boolean): boolean;
}

export default ({ env }: { env: StrapiEnv }) => {
  const client = env('DATABASE_CLIENT', 'postgres');
  const databaseUrl = env('DATABASE_URL') || env('STRAPI_DATABASE_URL');

  return {
    connection: {
      client,
      connection: databaseUrl
        ? {
            connectionString: databaseUrl,
            ssl: env.bool('DATABASE_SSL', false),
          }
        : {
            host: env('DATABASE_HOST', 'localhost'),
            port: env.int('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'strapi_db'),
            user: env('DATABASE_USERNAME', 'postgres'),
            password: env('DATABASE_PASSWORD', 'postgres_secure_password'),
            ssl: env.bool('DATABASE_SSL', false),
          },
      useNullAsDefault: true,
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
