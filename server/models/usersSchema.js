const mongoose = require("mongoose");
const validator = require("validator");
const encryptField = require('../utils/aesEncryptin').encryptField;
const decryptFieldwithKey = require('../utils/aesEncryptin').decryptFieldwithKey;
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw Error("not valid email")
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 10
    },
    gender: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    profile: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    datecreated:Date,
    dateUpdated:Date
});

// userSchema.pre('save', async function (next) {
//     this.fname = await encryptField(this.fname);
//     this.lname = await encryptField(this.lname);
//     this.mobile = await encryptField(this.mobile);
//     this.email = await encryptField(this.email);
//     this.gender = await encryptField(this.gender);
//     this.status = await encryptField(this.status);
//     this.location = await encryptField(this.location);
//     next();
//   });
  

// userSchema.methods.decryptEmail = async function () {
//     return decryptFieldwithKey('email', this.email);

//   };
// model
const users = new mongoose.model("users",userSchema);

module.exports = users;