const devAuthorize = async (req, res, next) => {
  const { user, devUserAuthenticate, devUserRoles, devUserPermissions } = req;
  if (!devUserAuthenticate) return next();
  if (!user) {
    return res.status(403).json({
      errStatus: 403,
      message: 'Unauthorized, user not found.',
      status: 'FAILED',
    });
  }
  const { userRoles = [], permissions = [] } = user;
  if (devUserRoles?.length) {
    const hasRole = userRoles.some((role) => devUserRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        errStatus: 403,
        message: 'Unauthorized, insufficient role.',
        status: 'FAILED',
      });
    }
  }
  if (devUserPermissions?.length) {
    const hasPermission = devUserPermissions.some((p) => permissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({
        errStatus: 403,
        message: 'Unauthorized, insufficient permission.',
        status: 'FAILED',
      });
    }
  }
  return next();
};
export default devAuthorize;
