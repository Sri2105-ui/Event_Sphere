import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'eventsphere_super_secret_jwt_key_2026_modern_secure'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Stale authentication check:
    // If the JWT contains a role that doesn't match the current database role,
    // require the user to obtain a fresh token rather than trusting an outdated role.
    if (decoded.role && decoded.role !== user.role) {
      console.warn(
        `[Auth Stale Role] User ID: ${user._id} presented token with role [${decoded.role}] but MongoDB role is [${user.role}]. Rejecting stale token.`
      );
      return res.status(401).json({
        success: false,
        message: 'Your account role has changed since your last login. Please log in again to refresh your session.'
      });
    }

    req.user = user;

    // Safe debugging log
    console.log(
      `[Auth Protect] User ID: ${user._id} | User Role: ${user.role} | Method: ${req.method} | Route: ${req.originalUrl || req.baseUrl + req.path}`
    );

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.'
    });
  }
};

// Optional auth for public endpoints where logged-in state adds extra context
export const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'eventsphere_super_secret_jwt_key_2026_modern_secure'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Ignore token error for optional auth
    }
  }
  next();
};
