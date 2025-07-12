import mongoose from 'mongoose';

const uri = process.env.MONGODB_STRING_CONNECTION;

export async function connectToDatabase(): Promise<void> {
    await mongoose.connect(uri)
    .then(() => console.log(" MongoDB has connected successfully"))
    .catch((err) => console.log("error connecting to MongoDB", err));
}