import AuthController from '../controllers/authController.js';

const checkForAuth = async (req, res, next) => {
    console.log("6 checkAuth called");
    req.user = null;
    const authorizationValue = req?.headers["authorization"];
    
    if (!authorizationValue || !authorizationValue.startsWith('Bearer')) {
        return next();
    }

    const token = authorizationValue.split(" ")[1];

    try {
        const user = await AuthController.getUserByToken(token);
        console.log("7 userByToken:", user);
        req.user = user;
        return next();
    } catch (error) {
        if (error.message === 'jwt expired') {
            // return res.status(401).json({ status : "failed", message : 'Token has expired' });
            return next();
        } else {
            return res.status(500).json({ status : "failed", message : 'Internal Server Error' });
        }
    }
};

export default checkForAuth;
