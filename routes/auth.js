const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const _ = require("lodash");

const { User } = require("../models/user");

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
            res.status(400).send(error.details[0].message)
        }
        //retreive the user and if he had been register
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            res.status(400).send('Invalid email or password')
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).send('Invalid email or password')
        }
        const token = user.generateAuthToken();
        res.json(token)

    }
    //
    createUser()

    function validateUser(req) {
        //
        const validationSchema = Joi.object({
            email: Joi.string().min(3).max(255).required(),
            password: Joi.string().min(5).max(255).required(),
        })
        return validationSchema.validate(req);

    }

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