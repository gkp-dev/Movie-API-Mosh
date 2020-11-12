const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const { User, validateUser } = require("../models/user");

//middleware
router.use(express.json());

router.get("/", async(req, res) => {
    const users = await User.find()
        .select("name email");

    if (!users) {
        res.send("There is no users...")
    } else {
        res.json(users)
    }
})

router.post("/", (req, res) => {
    //
    async function createUser() {

        //
        //retreive the user and if he had been register
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            res.status(400).send('User already registered')
        }
        //If not
        user = new User(_.pick(req.body, ["name", "email", "password"]));

        //Validation
        const { error } = validateUser(user);
        if (error) res.status(400).send(error.details[0].message)

        //hashing the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)

        await user.save();
        res.send(_.pick(user, ["_id", "name", "email"]));
    }
    //
    createUser()

})

router.put('/:id', (req, res) => {
    async function updateUser() {
        //
        const user = await User.updateOne({ _id: req.params.id }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
        })
        validateUser(user);
        res.json("User has been modified successfuly..")
            //
    }
    updateUser()

})

router.delete('/:id', (req, res) => {
    //
    async function deleteUser() {
        const user = await User.deleteOne({ _id: req.params.id })
        res.json("User has been deleted..")

    }
    deleteUser()
})

module.exports = router;