const mongoose = require("mongoose");

const mongoDbUri = process.env.MONGODB_URI

if (!mongoDbUri) {
    throw new Error("Please Provide Mongodb Uri, Error in db.js");
}
async function connectDb() {
    try {
        await mongoose.connect(mongoDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.log("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}

module.exports = connectDb;
