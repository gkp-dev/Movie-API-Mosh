const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validateUser } = require("../models/user");

const router = express.Router();

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

        //validation
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message)
        }

        //retreive the user and if he had been register
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json('User already registered')
        }

        //If not
        user = new User(_.pick(req.body, ["name", "email", "password"]));

        //hashing the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)

        await user.save();
        const token = user.generateAuthToken();
        res.header('x-auth-token', token).json(_.pick(user, ["_id", "name", "email"]));
    }
    //
    createUser()

})

router.put('/:id', (req, res) => {
    async function updateUser() {
        //Validation
        const { error } = validateUser(req.body);
        if (error) {
            res.status(400).send(error.details[0].message)
        }
        //Update
        const user = await User.updateOne({ _id: req.params.id }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
        })
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