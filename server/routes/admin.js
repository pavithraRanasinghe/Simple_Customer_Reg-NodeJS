const Admin = require('../models/Admin');
const express = require('express');
const jwt = require('jsonwebtoken');
const router =express.Router();
const localStorage = require('localStorage');


router.post('/login',(req,res)=>{
    const {username,password} = req.body;

    return new Promise((resolve, reject) => {
        try {
            Admin.findByUsername(username, password).then(() => {
                console.log("generate token");
                const accessToken = jwt.sign({
                    username: username,
                }, '123abc', {
                    expiresIn: '1d'
                });
                console.log("Genarated Token : " + accessToken);
                if (!accessToken){
                    return res.send("Token not generated");
                }
                localStorage.setItem("token",accessToken);
                res.render('customer.hbs');
            })
        } catch (e) {
            return reject;
        }
    });
});

module.exports = router;