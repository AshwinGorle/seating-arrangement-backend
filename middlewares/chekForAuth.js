import AuthController from '../controllers/authController.js';

const checkForAuth = async (req, res, next) => {
    console.log("checkAuth called")
    req.user = null;
    const authorizationValue = req?.headers["authorization"];
    console.log("authorizationValue token", authorizationValue );
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
            console.log("auth error : ", error)
            return res.status(500).json({ status : "failed", message : 'Internal Server while verifying token' });
        }
    }
};

export default checkForAuth;
