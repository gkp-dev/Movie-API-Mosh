const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 75,
        required: true
    },
    email: {
        type: String,
        minlength: 3,
        maxlength: 255,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minlength: 5,
        maxlength: 1024,
        required: true
    },
    isAdmin: {
        type: Boolean
    }
})

//Add authentification methods
userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, `${process.env.jwtPrivateKey}`);

}

const User = mongoose.model("user", userSchema);

const validateUser = (user) => {
    //
    const validationSchema = Joi.object({

        name: Joi.string().min(2).max(75).required(),
        email: Joi.string().min(3).max(255).required(),
        password: Joi.string().min(5).max(255).required(),
    })
    return validationSchema.validate(user);

}

module.exports.User = User;
module.exports.validateUser = validateUser;