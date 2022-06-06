const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { validate, ValidationError, Joi } = require('express-validation');
const port=8080;
const pVal = {
    body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    })
  }

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());



app.get("/",(req,res)=>{
    res.send("Voting System! Enter url--> localhost:8080/votes/voters to see list of valid voters")
})

app.post("/user/create",(req,res)=>{
    const id = uuidv4();
    req.body = {...req.body,id}
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        pdone.users = [...pdone.users,req.body];

        fs.writeFile("./db.json",JSON.stringify(pdone),{encoding:"utf-8"},()=>{
            res.status(201).send({status:"User Created with id:",id:id});
        })
    })
})


app.post("/user/login",validate(pVal, {}, {}),(req,res)=>{
    console.log(req.body.username,req.body.password)
    const token = uuidv4();
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        pdone.users.map((e)=>{
            if(e.username==req.body.username && e.password==req.body.password){
                e.token=token;
            }
        })
        pdone.users = [...pdone.users];

        fs.writeFile("./db.json",JSON.stringify(pdone),{encoding:"utf-8"},()=>{
            res.status(201).send("Login successfull");
        })
    })
})

app.use(function(err, req, res, next) {
    if (err instanceof ValidationError) {
      return res.status(400).send("Username and Password can't be empty!")
    }
    return res.status(500).json(err)
  })


  app.post("/user/logout",(req,res)=>{
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        pdone.users.map((e)=>{
            if(e.username==req.body.username && e.password==req.body.password){
                e.token="";
            }
        })
        pdone.users = [...pdone.users];

        fs.writeFile("./db.json",JSON.stringify(pdone),{encoding:"utf-8"},()=>{
            res.status(200).send("Logged Out");
        })
    })
}) 

app.get("/votes/voters",(req,res)=>{
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        const voters = pdone.users.filter(e => e.role=="voter")
        res.send(voters);
    })
})

app.get("/votes/party/:party",(req,res)=>{
    const {party} = req.params;
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        const parties = pdone.users.filter(e => e.party==party)
        res.send(parties);
    })
})

app.post("/votes/vote/:name",(req,res)=>{
    const {name} = req.params; 
    let flag = false;
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        pdone.users.map((e)=>{
            if(e.name==name){
                flag = true;
                e.votes = Number(e.votes)+1;
            }
        })
        if(!flag) res.send("User not found");
        else{
            pdone.users = [...pdone.users];

            fs.writeFile("./db.json",JSON.stringify(pdone),{encoding:"utf-8"},()=>{
                res.status(200).send({status:"Vote Casted",name:name});
            })
        }
       
    })
})

app.get("/votes/count/:user",(req,res)=>{
    const {user} = req.params;
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        const userData = pdone.users.filter(el => el.name == user);
        if(userData.length==0) res.send({status: "User Not Found!"})
        else{
            const d = userData[0];
            res.send({status: d.votes});
        }
    })
})

app.get("/db",(req,res)=>{
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        res.send(pdone);
    })
})

app.post("/db",(req,res)=>{
    const id = uuidv4();
    req.body = {...req.body,id}
    fs.readFile("./db.json","utf-8",(err,data)=>{
        const pdone = JSON.parse(data);
        pdone.users = [...pdone.users,req.body];

        fs.writeFile("./db.json",JSON.stringify(pdone),{encoding:"utf-8"},()=>{
            res.status(201).send({status:"User Created",id:id});
        })
    })
})

app.listen(port,()=>{
    console.log(`Server started at ${port}`)
})