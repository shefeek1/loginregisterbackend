const express = require("express")
const app = express()
app.use(express.json())

const cors = require("cors")
app.use(cors())

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const JWT_SECRET ="superkey12345"

const mongoose = require("mongoose")

const mongourl="mongodb+srv://shefeeks:12345@cluster0.fz2ddhl.mongodb.net/?retryWrites=true&w=majority"

//const mongourl="mongodb+srv://shefeeks:12345@cluster0.ryohch8.mongodb.net/?retryWrites=true&w=majority"
//const mongourl="mongodb+srv://shefeeks:12345@cluster0.bjxbooj.mongodb.net/test"

mongoose.connect(mongourl,{
    useNewUrlParser: true,
}).then(()=>{
    console.log("Connected to Database")
})
.catch((e)=>console.log(e))




app.listen(5000, ()=>{
    console.log("Server Started at Port 5000")
})

app.post("/post", async(req,res)=>{
    console.log(req.body)
    const{data}=req.body

    
    try {
         if(data=="shefeeks")
         res.send({status:"ok"})
         else{
            res.send({status:"User not Found"})
         }

    } catch (error) {
        res.send({status:"Something went Wrong"})
    }

})

require("./userDeatails")

const User = mongoose.model("UserInfo");

app.post("/register", async(req, res)=>{
    const { fname,lname, email, password } = req.body ;
    
    const encryptedPassword = await bcrypt.hash(password,10)
   
    try {
      
        const olduser= await User.findOne({email});
         if(olduser)
         {
            return res.json({error:"User Exists", message:"User Exists"})
         }

        await User.create({
               fname,
               lname,
               email,
               password: encryptedPassword,
        })
        res.send({status:"ok"})
    } catch (error) {
        console.log(error)
        res.send({status:"error"})
    }
})
app.post("/login", async (req,res)=>{
    const {email, password} = req.body;
    //console.log(res.status)
    const user = await User.findOne({ email} )
    if(!user){
        return res.json({error: "User not Found"})
    }

   if( await bcrypt.compare(password,user.password)){
    const token = jwt.sign({email:user.email}, JWT_SECRET,{
        expiresIn:10,
    })
    
    if(res.status(201)){
        return res.json({status:"ok", data:token})
    }
    else{
        return res.json({error:"error"})
    }
   }
   res.json({status:"error", error:"Invalid Password"})


})

app.post("/userData", async(req,res)=>{
    const { token } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET, (err, res)=>{
            if(err)
            {
                console.log(err)
                return "token expired"
            }
            console.log(res)
            return res;
        })
        console.log(user);
        if(user=="token expired")
        {
         return   res.send({status:"error", data:"token expired"})
        } 
        const userEmail = user.email
        User.findOne({email:userEmail})
        .then((data)=>{
            res.send({status:"ok", data:data})
        }).catch((error)=>{
           res.send({status:"error", data:error})

        })
    } catch (error) {
        
    }
})
