export const authorize = (...roles) => {
  return (req, res, next) => {
    const userId = req.user?._id || 'unauthenticated';
    const userRole = req.user?.role || 'none';
    const method = req.method;
    const route = req.originalUrl || (req.baseUrl + req.path);

    // Safe debugging log
    console.log(
      `[RBAC Auth Check] Authenticated user ID: ${userId} | Authenticated user role: ${userRole} | Requested HTTP method: ${method} | Requested route: ${route} | Allowed roles: [${roles.join(', ')}]`
    );

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(
        `[RBAC Forbidden] Authenticated user ID: ${userId} | Authenticated user role: ${userRole} | Requested HTTP method: ${method} | Requested route: ${route} | Allowed roles: [${roles.join(', ')}]`
      );
      return res.status(403).json({
        success: false,
        message: `Role [${req.user.role}] is not authorized to access this route.`
      });
    }

    next();
  };
};
