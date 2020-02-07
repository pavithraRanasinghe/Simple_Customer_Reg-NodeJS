const mongoose = require('mongoose');
const validator = require('validator');

const CustomerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:{
            validator:validator.isEmail,
            message:'{VALUE} is not a valid email'
        }
    },
    mobile:{
        type:String,
        required:true,
        unique: true,
    },
    address:{
        type:String,
        required:true
    },
    profile_pic:{
        type:String
    }
});

const Customer = mongoose.model('customer',CustomerSchema);

module.exports = Customer;