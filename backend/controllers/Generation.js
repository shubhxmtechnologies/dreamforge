const { GoogleGenAI, Modality } = require("@google/genai");
const { v2: cloudinary } = require("cloudinary");
const Generations = require("../models/generations");
const User = require("../models/user");
const mongoose = require("mongoose");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "gemini-ai-images" }, // Optional: specify a folder
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        // Write the buffer to the stream
        uploadStream.end(buffer);
    });
};

const generateImages = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Get the prompt from the request body, with a fallback default
        const prompt = req.body.prompt

        if (!prompt) {
            return res.status(400).json({
                error: "Please Provide Prompt."
            })
        }


        const user = await User.findById(req.user.id).session(session);

        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: "User not found." });
        }

        if (user.credits <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ error: "Not enough credits. Please Try After 12 A.M." });
        }
        // Generate the image content using Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: prompt,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        // Find the image part in the response
        const imagePart = response.candidates[0]?.content?.parts.find(p => p.inlineData);

        if (!imagePart) {
            await session.abortTransaction(); // START CHANGE: rollback if fail
            session.endSession();
            return res.status(500).json({ error: "Image generation failed or returned no image data." });
        } // END CHANGE


        // Convert the base64 data to a buffer
        const imageData = imagePart.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");


        // Upload the buffer to Cloudinary
        const uploadResult = await uploadToCloudinary(buffer);

        await Generations.findOneAndUpdate(
            {
                userId: req.user.id,
            },
            {
                $push: {
                    generations: {
                        prompt: prompt,
                        image: uploadResult.secure_url
                    }
                }
            },
            {
                upsert: true,
                new: true, session
            })

        const updatedUser = await User.findByIdAndUpdate(req.user.id,
            {
                $inc: { credits: -5 }
            },
            { new: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        // Respond with the secure URL from Cloudinary
        return res.status(200).json({
            success: true,
            message: "Image generated and uploaded successfully!",
            imageUrl: uploadResult.secure_url,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                credits: updatedUser.credits
            }
        });

    } catch (error) {
        await session.abortTransaction(); // START CHANGE: rollback if any error
        session.endSession(); // END CHANGE
        console.log("An error occurred at generations :", error);
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred.",
            error: error.message,
        });
    }
};


// controllers/Generations.js

const getGenerations = async (req, res) => {
    try {
        const { page = 0, limit = 8 } = req.query;
        const userId = req.user.id; // comes from AuthMiddleware
        const userGenerations = await Generations.findOne({ userId });

        if (!userGenerations || userGenerations.generations.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                nextCursor: undefined
            });
        }
        const start = page * limit;
        const end = start + limit;
        const paginated = userGenerations.generations.slice(start, end);

        res.status(200).json({
            success: true,
            data: paginated,
            nextCursor: end < userGenerations.generations.length ? Number(page) + 1 : undefined
        });
    } catch (err) {
        console.log("Error fetching generations:", err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};


module.exports = { generateImages, getGenerations }