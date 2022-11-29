import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    accName: {
      type: String,
      require: [true, "accName is required field"],
      min: [3, "The number of letters is small"],
      max: [16, "The number of letters is so big"],
      unique: true,
    },
    name: {
      type: String,
      require: [true, "name is required field"],
      min: [3, "The number of letters is small"],
      max: [24, "The number of letters is so big"],
    },
    familyName: {
      type: String,
      require: [true, "familyName is required field"],
      min: [3, "The number of letters is small"],
      max: [50, "The number of letters is so big"],
    },
    email: {
      type: String,
      require: [true, "email is required field"],
      min: [3, "The number of letters is small"],
      max: [255, "The number of letters is so big"],
      unique: true,
    },
    phoneNumber: {
      type: String,
      require: [true, "phoneNumber is required field"],
      validate: {
        validator: function (v) {
          var re = /^09[0-9]{9}$/;
          return re.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      unique: true,
    },
    password: {
      type: String,
      require: [true, "password is required field"],
      min: [4, "The number of password is small"],
      max: [16, "The number of password is so big"],
    },
    isAdmin: { type: Boolean, default: false, required: true },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
