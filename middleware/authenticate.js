const Admin = require('./../models/admin');

const authenticate = (req,res,next)=>{
    const token = req.header('x-auth');
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