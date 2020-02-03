const mongoose = require('mongoose');
const validator = require('validator');

const CustomerSchema = new mongoose.Schema({
    username:{
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
        minlength:9
    },
    address:{
        type:String,
        required:true
    }
});

const Customer = mongoose.model('customer',CustomerSchema);

module.exports = Customer;