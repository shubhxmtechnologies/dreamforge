require("dotenv").config()
const express = require('express')
const cors = require("cors")
const connectDB = require("./utils/db")
const { Signup, Login, GetUserDetails } = require("./controllers/AuthRoutes")
const AuthMiddleWare = require("./middleware/authmiddleware")
const { generateImages, getGenerations } = require("./controllers/Generation")
const app = express()
const cron = require("node-cron");
const User = require("./models/user")
app.use(express.json())
app.use(cors())
const port = process.env.PORT

app.get('/', (req, res) => {
    res.send('Server Is Running.')
})

app.post("/api/v1/signup", Signup)
app.post("/api/v1/login", Login)
app.get("/api/v1/getUser", AuthMiddleWare, GetUserDetails)


app.post("/api/v1/generate-image", AuthMiddleWare, generateImages)
app.get("/api/v1/generations", AuthMiddleWare, getGenerations);
cron.schedule("0 0 * * *", async () => {
    try {

        await User.updateMany({}, { $set: { credits: 40 } });

    } catch (err) {

        console.log("❌ Error resetting credits:", err);
    }
});
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`App Is Running...`)
    })
})