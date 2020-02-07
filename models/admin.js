const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});


AdminSchema.statics.findByToken = function (token) {
    return new Promise(async (resolve, reject) => {
        try {
            const decode = jwt.verify(token, '123abc');
            console.log("Find by token : "+token);
            console.log(decode);
            const find = await this.findOne({
                username: decode.username
            });
            console.log("Token User : "+find);
            resolve(find);
        } catch (e) {
            console.log("ERRRR", e);
            reject();
        }
    });
};

AdminSchema.statics.findByUsername = function (username, password) {
    const Admin = this;
    console.log("Admin : "+username+"  :  "+password);
    return Admin.findOne({username}).then((user) => {
        if (!user) {
            console.log("User not found");
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    return resolve(user);
                } else {
                    console.log("Password is wrong");
                    reject();
                }
            });
        });
    });
};

AdminSchema.pre('save', function (next) {
    const admin = this;

    if (admin.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(admin.password, salt, (err, hash) => {
                admin.password = hash;
                next();
            });
        });
    }
});

const Admin = mongoose.model('admin', AdminSchema);

module.exports = Admin;