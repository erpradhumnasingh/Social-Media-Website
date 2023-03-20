const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {error,success} = require("../utils/responseWrapper")


const signupController=async(req,res)=>{
    try{
         const{name,email,password}=req.body;

         if(!email||!password||!name){
            // return res.status(400).send('all field require');
            return res.send(error(400,'all field require'))
         }

          const oldUser = await User.findOne({email});
          if(oldUser){
            // return res.status(409).send('user already register');
            return res.send(error(409,'user already register'))
          }
          
          const hashPassword = await bcrypt.hash(password,10);

          const user = await User.create({
            email,
            name,
            password:hashPassword
          });

          // return res.status(201).json({
          //   user,
          // });
          const newUser = await User.findById(user._id);
          return res.send(
            success(201,'user create succesfully')
            );
    }catch(err){
        return res.send(error(500,err.message));
    }
};



const loginController=async(req,res)=>{
    try{
        const{email,password}=req.body;

        if(!email||!password){
          //  return res.status(400).send('all field require');
        return res.send(error(400,'all field require'))
        }

         const user = await User.findOne({email}).select('+password');
         if(!user){
          //  return res.status(404).send('user is not register');
          return res.send(error(404,'user is not register'))
         }

         const matched = await bcrypt.compare(password,user.password);
         if(!matched){
          //  return res.status(404).send('password is wrong');
          return res.send(error(404,'password is wrong'))
         }
         
         const accessToken = generateToken({
            _id:user._id
        } ); 
        const refreshToken = generateRefreshToken({
            _id:user._id
        } ); 
         
        res.cookie('jwt',refreshToken,{
          httpOnly:true,
          secure:true 
          
        })
         return res.send(success(200,{ accessToken  }));


    }catch(err){
      return res.send(error(500,err.message));
  }
}

const logoutController = async (req, res) => {
  try {
      res.clearCookie('jwt', {
          httpOnly: true,
          secure: true,
      })
      return res.send(success(200, 'user logged out'))
  } catch (e) {
      return res.send(error(500, e.message));
  }
}

//this api will check the refresh token validity and genrates a new access token
const refreshAcessTokenController=  async (req, res) => {
     const cookies = req.cookies;
     if(!cookies.jwt) {
      // return res.status(401).send('invalid refresh token');
      return res.send(error(401,' refresh token require'))
     }
     const refreshToken = cookies.jwt;
    // const{refreshToken}=req.body;

    // if(!refreshToken){
    //     return res.status(400).send('refresh token require');
    // }

    try {  
        const decoded = jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_PRIVATE_KEY
            );
           const _id=decoded._id;
           const accessToken =generateToken({_id});
         return res.send(success(201,{accessToken}));
            
    }catch(err){
         console.log(err);
        //  return res.status(401).send('invalid refresh token');
        return res.send(error(401,'invalid refresh token'))
    }

};

//internal function
const generateToken=(data)=>{
   try{
  const token = jwt.sign(data,process.env.ACCESS_TOKEN_PRIVATE_KEY,{
    expiresIn:'200000seconds',
  });

  console.log(token);
  return token; 
}catch(err){
  return res.send(error(500,err.message));
}
}


const generateRefreshToken=(data)=>{
    try{
   const token = jwt.sign(data,process.env.REFRESH_TOKEN_PRIVATE_KEY,{
     expiresIn:"10000000000seconds",
   });
  
   console.log(token);
   return token;
 }catch(err){
  return res.send(error(500,err.message));
}
 }

module.exports={
    signupController,
    loginController,
    refreshAcessTokenController,
    logoutController
}