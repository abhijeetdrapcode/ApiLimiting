import session from 'express-session';
import store from 'connect-redis';
import { redisClient } from 'drapcode-redis';

export async function initRedisSession(app) {
  const RedisStore = store(session);
  app.use(
    session({
      secret: 'somerandonstuffs',
      store: new RedisStore({ client: redisClient }),
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 24 * 60 * 60 * 1000 }, // expiration time: 1 day
    }),
  );
}
