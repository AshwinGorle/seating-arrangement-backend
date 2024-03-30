import AuthController from '../controllers/authController.js'

const checkForAuth = async (req, res, next) =>{
    console.log("6 chekAuth called ");
    req.user = null;
    const authorizationValue = req?.headers["authorization"];
    if(!authorizationValue || !authorizationValue.startsWith('Bearer')) return next();
    const token = authorizationValue.split(" ")[1];
    const user = await AuthController.getUserByToken(token);
    console.log("7 userByToken : ",user);
    req.user = user;
    return next();  
}


export default checkForAuth;