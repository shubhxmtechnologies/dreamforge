// models/User.js
const mongoose = require("mongoose");

const GenerationsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    generations: [
        {
            prompt: { type: String, required: true },
            image: { type: String, required: true }, // can be URL or base64
        }],
}, { timestamps: true });

const Generations = mongoose.model("Generations", GenerationsSchema);

module.exports = Generations;
