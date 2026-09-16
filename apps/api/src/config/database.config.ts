import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  logging: process.env.DB_LOGGING === 'true',
  sync: process.env.DB_SYNC === 'true',
}));
