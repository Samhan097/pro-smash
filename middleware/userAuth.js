import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  let token = req.cookies?.token;

  // Also check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided. Please login." });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.user = { userId: tokenDecode.id };
      next();
    } else {
      return res.status(400).json({ success: false, message: "Not Authorized. Login Again." });
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Session expired. Please login again." });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default userAuth;
