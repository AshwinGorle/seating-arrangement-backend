

const restrictTo = (roles=[])=>{
   return (req, res, next)=>{
        if(!req?.user) return res.status(401).send({status : "falied" , message : "unauthorized user!"});
        if(roles.includes("all")) return next();
        if(!(roles.includes(req?.user?.role))) return res.status(401).send({status : "falied" , message : "unauthorized user!"}); 
        next();
     }

}
export default restrictTo;