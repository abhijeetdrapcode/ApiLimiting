const axios = require('axios');

const generateTokenFromApp1 = async (req,res)=>{
    try{
        const response = await axios.get('http://localhost:3000/api/generate-token');
        const token = response.data.token;
        // req.session.token = token;
        res.status(201).json({message:'Token generated and saved',token});
    }catch(error){
        console.log("Error generating token from app1");
        res.status(500).json({error:"Failed to generate token from app1"});
    }
}

module.exports = generateTokenFromApp1;