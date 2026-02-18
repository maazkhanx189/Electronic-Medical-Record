import mongoose from "mongoose";

const connectDb = async () => {
    const url = process.env.MONGODBURI;

    if (!url) {
        console.error("MONGODBURI environment variable is not defined");
        process.exit(1);
    }

    try {
        await mongoose.connect(url);
        console.log("Connection has been Made.");
    } catch (error) {
        console.error("Something is wrong with the database connection:", error);
        process.exit(1);
    }
}

export default connectDb;
