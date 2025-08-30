const User = require("../models/user");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Please Provide Jwt.");
}

const Signup = async (req, res) => {
    const { name, email, password, avatar } = req.body;

    // Fields to check
    const fields = { name, email, password, avatar };

    // Loop through each field
    for (let key in fields) {
        if (!fields[key] || fields[key].trim() === "") {
            return res.status(400).json({ error: `Provide ${key}` });
        }
    }

    // Password length check
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    // Email format check (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Provide a valid email address" });
    }

    // finding user with same email
    try {

        const foundUser = await User.findOne({ email: email })
        if (foundUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const newUser = await User.create({ name, email, password, credits: 40, avatar });
        const token = jwt.sign(
            { id: newUser._id },
            JWT_SECRET,
        );
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
                credits: newUser.credits
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });

    }



}

const Login = async (req, res) => {
    const { email, password, } = req.body;

    // Fields to check
    const fields = { email, password };

    // Loop through each field
    for (let key in fields) {
        if (!fields[key] || fields[key].trim() === "") {
            return res.status(400).json({ error: `Provide ${key}` });
        }
    }

    // Password length check
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    // Email format check (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Provide a valid email address" });
    }

    // finding user with same email
    try {

        const foundUser = await User.findOne({ email: email })
        if (!foundUser) {
            return res.status(400).json({ error: "User Not Found." });
        }

        const isCorrectPassword = await bcrypt.compare(password, foundUser.password)
        if (!isCorrectPassword) {
            return res.status(400).json({ error: "Invalid password" });
        }
        const token = jwt.sign(
            { id: foundUser._id },
            JWT_SECRET,
        );

        res.status(201).json({
            message: "Login successful",
            token,
            user: {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                avatar: foundUser.avatar,
                credits: foundUser.credits
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });

    }



}

const GetUserDetails = async (req, res) => {
    const { id } = req.user;

    try {

        const foundUser = await User.findById(id)
        if (!foundUser) {
            return res.status(400).json({ error: "User Not Found." });
        }


        return res.status(201).json({
            user: {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                avatar: foundUser.avatar,
                credits: foundUser.credits
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });

    }



}



module.exports = {
    Signup,
    Login,
    GetUserDetails
}