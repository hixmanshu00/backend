import express from 'express';
import path from 'path'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend"
}).then(()=> console.log("Database connected")).catch((e)=> console.log(e))

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const users = mongoose.model("users", userSchema);

app.set("view engine", "ejs")

app.use(express.static(path.join(path.resolve(),"public")))

app.use(cookieParser());

app.use(express.urlencoded({extended:true}))

const isAuthenticated = async (req,res,next) => {
    const {token} = req.cookies;
    
    // console.log(token)
    if(token){
        const decoded = jwt.verify(token,"beginhi2.0")
         req.user = await users.findById(decoded.id)
        // console.log(user)
        next();
    }
    else{
        res.redirect('/login')
    }

}

app.get('/login',(req,res)=>{
    res.render("login")
})

app.get('/',isAuthenticated, (req,res)=> {
    res.render("home.ejs", {name: req.user.name})
    
})

app.get('/register', (req,res)=> {
    res.render("register")
})

app.post('/register', async (req,res)=> {
    const {name, email, password} = req.body;
    const isUser = await users.findOne({email})
    if(isUser) res.redirect('/login')
    else{
    const hashed = await bcrypt.hash(password,10)
    const user = await users.create({
        name, email, password: hashed
    })
    res.redirect('/')
}
})

app.post('/login', async (req, res)=> {
    const {email, password} = req.body;
    const user = await users.findOne({email});
    // console.log(user) 
    if(!user){
        return res.redirect('/register')
    }
    else{
        const match = await bcrypt.compare(password, user.password)
        if(match){
        const token = jwt.sign({id:user._id},'beginhi2.0')
        res.cookie("token",token)
        // res.redirect('/')
        res.render("home", {name: user.name}) }
        else{
            res.render("login", {message: "Incorrect password"})
        }
    }
})

app.get('/logout', (req,res)=> {
    res.cookie("token", "")
    res.redirect('/')
})

app.listen(5000, ()=>{
    console.log("server working")
})