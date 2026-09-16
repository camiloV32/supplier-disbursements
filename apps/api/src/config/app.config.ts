import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number(process.env.PORT),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
}));
