interface StrapiEnv {
  (key: string, defaultValue?: any): any;
  int(key: string, defaultValue?: number): number;
  array(key: string, defaultValue?: string[]): string[];
  bool(key: string, defaultValue?: boolean): boolean;
}

export default ({ env }: { env: StrapiEnv }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'super_secure_users_permissions_jwt_secret_min32chars'),
    },
  },
});
