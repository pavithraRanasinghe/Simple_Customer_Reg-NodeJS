const Admin = require('../models/Admin');
const localStorage = require('localStorage');

const authenticate = (req,res,next)=>{
    const token = localStorage.getItem("token");
    console.log("Token in Authenticate : "+token);
    Admin.findByToken(token).then((admin)=>{
        if(!admin){
            console.log("Rejected Find Admin");
            return res.status(401).send('Authentication failed');
        }
        console.log("Admin from DB : "+admin.username);
        next();
    }).catch((err)=>{
        res.status(401).send(err);
    });
};

module.exports = {authenticate};