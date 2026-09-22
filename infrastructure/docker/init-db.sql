-- Initialize isolated logical databases for Medusa and Strapi
CREATE DATABASE medusa_db;
CREATE DATABASE strapi_db;

GRANT ALL PRIVILEGES ON DATABASE medusa_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE strapi_db TO postgres;
