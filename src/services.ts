export const ENV_VARIABLES = {
  mysql: {
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_USER: 'sail',
    DB_PASSWORD: 'password',
    DB_DATABASE: 'app',
  },
  mariadb: {
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_USER: 'sail',
    DB_PASSWORD: 'password',
    DB_DATABASE: 'app',
  },
  pgsql: {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'sail',
    DB_PASSWORD: 'password',
    DB_DATABASE: 'app',
  },
  redis: {
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
  },
  mailpit: {
    MAILPIT_PORT: '1025',
    SMTP_HOST: 'localhost',
    SMTP_PORT: '$MAILPIT_PORT',
  },
  minio: {
    MINIO_PORT: '9000',
    AWS_ACCESS_KEY_ID: 'sail',
    AWS_SECRET_ACCESS_KEY: 'password',
    AWS_REGION: 'us-east-1',
    S3_BUCKET: 'app',
    S3_ENDPOINT: 'http://localhost:$MINIO_PORT',
  },
  meilisearch: {
    MEILISEARCH_PORT: '7700',
    MEILISEARCH_HOST: 'http://localhost:$MEILISEARCH_PORT',
    MEILISEARCH_API_KEY: '',
  },
  typesense: {
    TYPESENSE_PORT: '8108',
    TYPESENSE_NODE_URL: 'http://localhost:$TYPESENSE_PORT',
    TYPESENSE_API_KEY: 'xyz',
  },
} as const

export type Service = keyof typeof ENV_VARIABLES
export const SERVICES = Object.keys(ENV_VARIABLES) as Service[]
export const DATABASES = new Set<Service>(['mysql', 'pgsql', 'mariadb'])
