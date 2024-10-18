exports[`Sail Add > generate compose.yml file 1`] = `"services:
  mysql:
    image: 'mysql:8.0'
    ports:
      - '\${DB_PORT:-3306}:3306'
    environment:
      MYSQL_ROOT_PASSWORD: '\${DB_PASSWORD}'
      MYSQL_ROOT_HOST: '%'
      MYSQL_DATABASE: '\${DB_DATABASE}'
      MYSQL_USER: '\${DB_USER}'
      MYSQL_PASSWORD: '\${DB_PASSWORD}'
      MYSQL_ALLOW_EMPTY_PASSWORD: 1
    volumes:
      - 'sail-mysql:/var/lib/mysql'
      - './node_modules/@deathman92/adonis-sail/build/stubs/database/mysql/create-testing-database.sh:/docker-entrypoint-initdb.d/10-create-testing-database.sh'
    networks:
      - 'sail'
    healthcheck:
      test:
        - 'CMD'
        - 'mysqladmin'
        - 'ping'
        - '-p\${DB_PASSWORD}'
      retries: 3
      timeout: '5s'
  redis:
    image: 'redis:alpine'
    ports:
      - '\${REDIS_PORT:-6379}:6379'
    volumes:
      - 'sail-redis:/data'
    networks:
      - 'sail'
    healthcheck:
      test:
        - 'CMD'
        - 'redis-cli'
        - 'ping'
      retries: 3
      timeout: '5s'
networks:
  sail:
    driver: 'bridge'
volumes:
  sail-mysql:
    driver: 'local'
  sail-redis:
    driver: 'local'
"`

exports[`Sail Add > generate compose.yml file 2`] = `"PORT=3333
DB_HOST=localhost
DB_PORT=3306
DB_USER=sail
DB_PASSWORD=password
DB_DATABASE=app
REDIS_HOST=localhost
REDIS_PORT=6379"`

exports[`Sail Add > asks for single database 1`] = `"services:
  pgsql:
    image: 'postgres:17'
    ports:
      - '\${DB_PORT:-5432}:5432'
    environment:
      PGPASSWORD: '\${DB_PASSWORD:-password}'
      POSTGRES_DB: '\${DB_DATABASE}'
      POSTGRES_USER: '\${DB_USER}'
      POSTGRES_PASSWORD: '\${DB_PASSWORD:-password}'
    volumes:
      - 'sail-pgsql:/var/lib/postgresql/data'
      - './node_modules/@deathman92/adonis-sail/build/stubs/database/pgsql/create-testing-database.sql:/docker-entrypoint-initdb.d/10-create-testing-database.sql'
    networks:
      - 'sail'
    healthcheck:
      test:
        - 'CMD'
        - 'pg_isready'
        - '-q'
        - '-d'
        - '\${DB_DATABASE}'
        - '-U'
        - '\${DB_USER}'
      retries: 3
      timeout: '5s'
networks:
  sail:
    driver: 'bridge'
volumes:
  sail-pgsql:
    driver: 'local'
"`

exports[`Sail Add > asks for single database 2`] = `"PORT=3333
DB_HOST=localhost
DB_PORT=5432
DB_USER=sail
DB_PASSWORD=password
DB_DATABASE=app"`

exports[`Sail Add > ask for single database 1`] = `"services:
  pgsql:
    image: 'postgres:17'
    ports:
      - '\${DB_PORT:-5432}:5432'
    environment:
      PGPASSWORD: '\${DB_PASSWORD:-password}'
      POSTGRES_DB: '\${DB_DATABASE}'
      POSTGRES_USER: '\${DB_USER}'
      POSTGRES_PASSWORD: '\${DB_PASSWORD:-password}'
    volumes:
      - 'sail-pgsql:/var/lib/postgresql/data'
      - './node_modules/@deathman92/adonis-sail/build/stubs/database/pgsql/create-testing-database.sql:/docker-entrypoint-initdb.d/10-create-testing-database.sql'
    networks:
      - 'sail'
    healthcheck:
      test:
        - 'CMD'
        - 'pg_isready'
        - '-q'
        - '-d'
        - '\${DB_DATABASE}'
        - '-U'
        - '\${DB_USER}'
      retries: 3
      timeout: '5s'
networks:
  sail:
    driver: 'bridge'
volumes:
  sail-pgsql:
    driver: 'local'
"`

exports[`Sail Add > ask for single database 2`] = `"PORT=3333
DB_HOST=localhost
DB_PORT=5432
DB_USER=sail
DB_PASSWORD=password
DB_DATABASE=app"`

