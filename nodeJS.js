import http from "http";
import fs from "fs"
import randomNum from './random.js'

const home = fs.readFileSync("./home.html", () => {
    console.log("done reading")
})
const server = http.createServer((req,res)=>{
    if(req.url==="/"){
        // res.end("Home baby")
        res.end(home)
    }
    else if(req.url==="/about"){
        res.end("About page")
    }
    else if(req.url==="/contact"){
        res.end("Contact page")
    }
    else if(req.url==="/random"){
        res.end(randomNum())
    }
    else{
        res.end("Page not found!!!")
    }
    console.log(req.url)
})

server.listen(5000, ()=> {
    console.log("Server is working")
})