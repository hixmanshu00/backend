import  express  from "express";
import path from 'path'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import  Jwt  from "jsonwebtoken";

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend"
}).then(()=> console.log("Database connected")).catch((e)=> console.log(e))

const userSchema = new mongoose.Schema({
    name: String,
    email:String
})

const users = mongoose.model("users",userSchema)

const app = express();

app.use(cookieParser());

app.use(express.static(path.join(path.resolve(),"public")))

app.use(express.urlencoded({extended:true}))

app.set('view engine','ejs')

app.get('/', (req,res)=> {
    // res.send("Hello world")
    res.sendFile(path.join(path.resolve(),"home.html"))
})

const isAuthenticated = async (req,res,next) => {
    const {token} = req.cookies;
    if(token){
        const decoded = Jwt.verify(token, 'osfdodfjweoi')
        // console.log(decoded)
        req.user = await users.findById(decoded._id);
        next();
    }
    else{
        res.render("login")
    }
}

// app.get('/contact', (req,res)=> {
//     res.render("index")
// })

// app.post('/contact', async (req,res)=> {
//     // console.log(req.body)
//     // res.send("ok")
//     const {name, email} = req.body;

//     await messages.create({name,email}).then(()=>{
//         res.send("Sucesss")
//     })
// })

app.get('/login', isAuthenticated, (req,res)=> {
    // console.log(req.user);
    res.render("logout", {name: req.user.name})
})

app.post('/login', async (req,res)=> {
    const {name, email} = req.body;
    const user = await users.create({name,email})

    const token = Jwt.sign({_id: user._id}, 'osfdodfjweoi')

    res.cookie("token", token, {
        httpOnly: true
    })
    // res.send("login success")
    // res.render("logout")
    res.redirect("/login")
    // console.log(req.cookies)
 
})

app.get('/logout', (req,res)=> {
    res.cookie("token", "", {
        httpOnly: true,
        // expires: Date.now()
    })
    // res.send("login success")
    // res.render("login")
    res.redirect("/login")

    // console.log(req.cookies)
})

// app.get('/addData', (req,res)=> {
//     messages.create({
//         name: "HIOwner",
//         email: "hiowner00@gmail.com"
//     }).then(()=> {
//         res.send("Data Added!!!")
//     })
// })

app.listen(5000, () => {
    console.log("Server is running on port 5000")
}) 