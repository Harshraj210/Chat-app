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
  
},{
  timestamps:true
});

// mongoose.model ->function that creates a model
// User  name of collection (in MDB it becomes users collection)
const User = mongoose.model("User",userSchema)
export default User
