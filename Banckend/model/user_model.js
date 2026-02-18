import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },

  email: {
    type: String,
    require: true,
  },

  phone: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },


});

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
  } catch (error) {
    next(error);
  }
});





userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};




userSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userID: this._id.toString(),
        userEmail: this.email,
        role: this.role
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "2d" }
    );
  } catch (error) {
    console.error(error);
  }
};

const User = new mongoose.model('user', userSchema);

export default User;