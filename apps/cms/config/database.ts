interface StrapiEnv {
  (key: string, defaultValue?: any): any;
  int(key: string, defaultValue?: number): number;
  array(key: string, defaultValue?: string[]): string[];
  bool(key: string, defaultValue?: boolean): boolean;
}

export default ({ env }: { env: StrapiEnv }) => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env(
        'STRAPI_DATABASE_URL',
        'postgres://postgres:postgres_secure_password@localhost:5432/strapi_db'
      ),
      ssl: false,
    },
    useNullAsDefault: true,
  },
});
