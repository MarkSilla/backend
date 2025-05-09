import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', ()=> {
        console.log("Connected kana idol")

    })

    await mongoose.connect(`${process.env.MONGODB_URL}/UniformXpress`)

}

export default connectDB