const mongoose = require('mongoose');

module.exports =async()=>{
    const mongoUri='mongodb+srv://username:passwordpassword@cluster0.sqagbd0.mongodb.net/?retryWrites=true&w=majority';
   
   try{
    const connect= await mongoose.connect(mongoUri,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    });

    console.log(`MongoDB Connected...${connect.connection.host}`);
    }catch(e){
    console.log(e);
    process.exit(1);
    }

}