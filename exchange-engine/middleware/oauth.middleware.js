export const paramHandling = async (req, res, next) => {
  const { params } = req.query;
  if (params) {
    if (req.path.includes('/auth/facebook')) {
      req.session.facebookParams = params;
    } else if (req.path.includes('/auth/twitter')) {
      req.session.twitterParams = params;
    } else if (req.path.includes('/login-oauth2')) {
      req.session.oAuth2Params = params;
    } else if (req.path.includes('/docusign')) {
      req.session.docusignParams = params;
    }
  }
  return next();
};
