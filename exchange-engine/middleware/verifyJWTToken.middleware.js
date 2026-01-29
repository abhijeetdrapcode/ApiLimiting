import passport from 'passport';
import { pluginCode } from 'drapcode-constant';
import { findInstalledPlugin } from '../install-plugin/installedPlugin.service';
import { userCollectionService } from '../collection/collection.service';
import { findItemById } from '../item/item.service';
import { verifyToken } from '../security/jwtUtils';
import { addNoCacheHeaders } from '../security/loginUtils';

export async function verifyJwt(req, res, next) {
  addNoCacheHeaders(res);
  if (req.originalUrl.includes('finder')) return next(); // if filter api
  let origin = req.get('origin');
  if (origin && origin.includes('admin')) return next();
  /**
   * Check if login plugin installed or not.
   */
  const { headers, projectId, db } = req;
  const loginPlugin = await findInstalledPlugin(projectId, pluginCode.LOGIN);
  if (!loginPlugin) {
    return next();
  }
  if (!headers.authorization) {
    console.log('returning no authorization');
    return res.status(401).send({ code: 401, message: 'No token provided.' });
  }
  console.log('checking');
  passport.authenticate('jwt', { session: false }, async function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      info.code = 403;
      return res.status(403).send(info);
    }

    const userCollection = await userCollectionService(projectId);
    let { data: userFromDb } = await findItemById(db, projectId, userCollection, null, {
      userName: user.sub,
    });
    if (!userFromDb) {
      return res.status(401).send({ code: 403, message: 'Invalid token.' });
    }
    req.user = userFromDb; // Forward user information to the next middleware
    next();
  })(req, res, next);
}

export async function verifyJwtForOpen(req, res, next) {
  addNoCacheHeaders(res);
  const { headers, db, projectId } = req;
  const authorizationHeader = headers.authorization;
  if (authorizationHeader) {
    const token = authorizationHeader.split(' ')[1];
    try {
      const payload = await verifyToken(token);
      req.user = payload;
      passport.authenticate('jwt', { session: false }, async function (err, user, info) {
        if (err) {
          return next(err);
        }
        if (!user) {
          info.code = 403;
          return res.status(403).send(info);
        }

        const userCollection = await userCollectionService(projectId);
        let { data: userFromDb } = await findItemById(db, projectId, userCollection, null, {
          userName: user.sub,
        });
        if (!userFromDb) {
          return res.status(401).send({ code: 403, message: 'Invalid token.' });
        }
        req.user = userFromDb; // Forward user information to the next middleware
        next();
      })(req, res, next);
    } catch (err) {
      console.error('verifyJwtForOpen err', err);
      throw new Error(err);
    }
  } else {
    next();
  }
}
