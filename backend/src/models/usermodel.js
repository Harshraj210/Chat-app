import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // blueprints
  name: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    require: true,
  },
});

// mongoose.model ->function that creates a model
const User = mongoose.model("User",userSchema)
export default User
