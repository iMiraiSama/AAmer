import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const isUser = (req, res, next) => {
    if (req.user && req.user.userType === 'user') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. User only route.' });
    }
};

export const isProvider = (req, res, next) => {
    if (req.user && req.user.userType === 'provider') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Provider only route.' });
    }
}; 