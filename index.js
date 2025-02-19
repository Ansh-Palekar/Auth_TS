const express=require("express");
const app=express();
const bcrypt = require('bcrypt');
const path=require('path');
const jwt=require("jsonwebtoken");

const protectRoute=require("./middlewares/authenticate_token.js");

const exp = require("constants");
const userModel=require("./models/user.js");

app.use(express.json());

const cookieParser = require("cookie-parser");

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'backend')));
app.use(cookieParser());


app.get("/",function(req,res)
{
    res.sendFile(path.join(__dirname, "public/sample.html"));

});

app.post("/create",async function(req,res)
{
    const {email,password}=req.body;

    bcrypt.genSalt(10, function(err, salt) {

        if(err)
        {
            console.log("Salt generation Error",err);
        }

        bcrypt.hash(password, salt, async function(err, hash) {

            if (err) {
                console.error("Hashing Error:", err);
            }


            let createdUser=await userModel.create({
                email:email,password:hash
            });

        });
    });
    
    res.sendFile(path.join(__dirname, "public/login.html")); 
});


app.get("/login",protectRoute,async function(req,res)
{
    res.sendFile(path.join(__dirname, "public/login.html"));  
}
);


app.post("/login",async function(req,res)
{
    const user=await userModel.findOne({email:req.body.email});

    if(!user){
        console.log("invalid");
        return res.status(400).send("Invalid credentials");
    }

    bcrypt.compare(req.body.password, user.password, function(err, result) {
        // result == true
        if(result)
        {
            //Generate Token
            let token=jwt.sign({email:user.email},"ansh"); //  ansh is the secret key
            res.cookie("token",token);
            console.log("Cookie Set:", req.cookies);
            return res.redirect("/main");
        }
        else{
            console.log("Invalid");
            return res.status(400).send("Invalid credentials");
        }      
    });
}
);


app.get("/main",async function(req,res) {
    
    res.sendFile(path.join(__dirname, "public/main.html"));
});




app.get("/logout",async function(req,res) {
    res.cookie("token","");  //delete the token value
    res.send("cookie deleted");
});



app.listen(7777,()=>{

    console.log("App Running");
}
);