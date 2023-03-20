const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {error}= require("../utils/responseWrapper")
module.exports=async(req,res,next)=>{
    if(
        !req.headers||
        !req.headers.authorization||
        !req.headers.authorization.startsWith("Bearer")
    ){
        // return res.status(401).send('authorisation header is required')
        return res.send(error(401,'authorisation header is required'))
    }

    const accessToken = req.headers.authorization.split(" ")[1];
    
    try {  
        const decoded =  jwt.verify(
            accessToken, 
            process.env.ACCESS_TOKEN_PRIVATE_KEY
            );
            
            req._id=decoded._id;
         
            const user = await User.findById(req._id);
            if(!user){
                return res.status(404).send('user not found');
            }
            next();
    }catch(e){
         console.log(e);
        //  return res.status(401).send('invalid token');
        return res.send(error(401,'invalid token'))
    }

     
} 