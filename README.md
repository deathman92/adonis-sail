<div align="center">
<br/>

## @deathman92/adonis-sail

### Generate a ready-to-use local docker environment for your Adonis application

<br/>
</div>

<div align="center">

[![@foadonis/magnify](https://img.shields.io/npm/v/%40deathman92%2Fadonis-sail?style=for-the-badge)](https://www.npmjs.com/package/@deathman92/adonis-sail) [![License](https://img.shields.io/github/license/deathman92/adonis-sail?label=License&style=for-the-badge)](LICENCE) ![](https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript)

</div>

## Installation

You can easily install and configure via the Ace CLI's `add` command.

```shell
node ace add @deathman92/adonis-sail
```

##### Manual Install & Configure

You can also manually install and configure if you'd prefer

```shell
pnpm install -D @deathman92/adonis-sail
```

```shell
node ace configure @deathman92/adonis-sail
```

## Available Services

- PostgreSQL
- MySQL
- MariaDB
- Redis
- Minio
- MailPit
- Meilisearch
- Typesense

## Usage

Make sure to install needed AdonisJs Package, and follow instructions before running Sail's commands.
`@adonisjs/lucid`, `@adonisjs/redis`, `@adonisjs/mail`, `@adonisjs/drive`, [`@foadonis/magnify`](https://github.com/FriendsOfAdonis/magnify).

### Commands

#### Sail Add

Add specified services to compose.yml file.

```shell
node ace sail:add [...services]
```

#### Sail Start

Starts specified services (empty for all) using `docker compose up -d` command. Optionally you can pass path to .env file (by default, .env file is using).

```shell
node ace sail:start [...services] [--env-file=.env]
```

#### Sail Stop

Stops specified services (empty for all) using `docker compose down` command.

```shell
node ace sail:stop [...services]
```

#### Sail Status

Print status of running services using `docker compose ps` command.

```shell
node ace sail:status
```

## Environment Variables

After installing or adding new service, needed environment variables will be added to `.env` file (overwritting existing).

#### Example

```shell
node ace sail:add pgsql redis
```

`.env` file

```shell
+ DB_HOST=localhost
+ DB_PORT=5432
+ DB_USER=sail
+ DB_PASSWORD=password
+ DB_DATABASE=app
+ REDIS_HOST=localhost
+ REDIS_PORT=6379
```

## Databases

To connect to your application's databases from your local machine, you may use a graphical database management application such as [TablePlus](https://tableplus.com/).
By default, exposed ports are :

- MySQL: 3306
- MariaDB: 3306
- PostgreSQL: 5432
- Redis: 6379

> [!NOTE]
> As of now you can install only one of database services (mysql, mariadb or pgsql). Configure or add command prompt you about database you want to use if you try to install many.

## Minio

If you plan to use Amazon S3 to store files while running your application in its production environment, you may wish to install the MinIO service when installing Sail. MinIO provides an S3 compatible API that you may use to develop locally using Adonis's S3 storage driver without creating "test" storage buckets in your production S3 environment. If you choose to install MinIO while installing Sail, a MinIO configuration section will be added to your application's compose.yml file.

You will need to [install the official Adonis drive](https://docs.adonisjs.com/guides/digging-deeper/drive) package with [S3 service](https://flydrive.dev/docs/services/s3) to use MinIO locally.

Then change configuration in `config/drive.ts` file like this:

```ts
...
s3: services.s3({
  credentials: {
    accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
  },
  region: env.get('AWS_REGION'),
  bucket: env.get('S3_BUCKET'),
  visibility: 'public',
  endpoint: env.get('S3_ENPOINT'),
  forcePathStyle: true,
  urlBuilder: {
    async generateURL(key, bucket, s3Client) {
      return `${env.get('S3_ENDPOINT')}/${bucket}/${key}`
    },
  },
})
...
```

You can now use the `@adonisjs/drive` package to store and fetch files like you would do normally on a real AWS bucket. You can also access MinIO dashboard at : http://localhost:8900/dashboard (user: `sail`, password: `password`).

## License

[MIT licensed](LICENSE.md).
