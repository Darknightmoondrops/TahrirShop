import Express, { response } from "express";
import User from "../models/userModels.js";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import { generateToken } from "../utils.js";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import crypto from "crypto";
const userRouter = Express.Router();
userRouter.get("/", async (req, res) => {
  const users = await User.find();
  res.send(users);
});
userRouter.post(
  "/signIn",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      console.log(bcrypt.compareSync(req.body.password, user.password), "crip");
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          familyName: user.familyName,
          accName: user.accName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "نام کاربری یا رمزتان اشتباه است !" });
  })
);
userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      familyName: req.body.familyName,
      accName: req.body.accName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      familyName: user.familyName,
      accName: user.accName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);
userRouter.post("/forgotPassword", (req, res) => {
  if (req.body.email === "") {
    res.status(400).send("email required");
  }
  console.error(req.body.email);
  User.findOne({
    email: req.body.email,
  }).then((users) => {
    if (users === null) {
      console.error("email not in database");
      res.status(403).send("email not in db");
    } else {
      const token = crypto.randomBytes(20).toString("hex");

      User.findOneAndUpdate(
        { email: req.body.email },
        {
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 3600000,
        }
      )
        .then(res.send({ message: "change shod !" }))
        .catch((error) => {
          console.log(error, "error");
        });

      console.log(users);
      console.log(users.resetPasswordExpires);

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        sevice: "Gmail",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "resetpasstahrirsite@gmail.com",
          pass: "vyjtlvfvpubwdbic",
        },
      });
      const mailOption = {
        from: "resetpasstahrirsite@gmail.com",
        to: `${users.email}`,
        subject: "Link To Reset Password",
        text:
          "شما این را دریافت می کنید زیرا شما (یا شخص دیگری) درخواست بازنشانی رمز عبور حساب خود را داده اید. \n\n" +
          "لطفاً بر روی پیوند زیر کلیک کنید، یا آن را در مرورگر خود قرار دهید تا طی یک ساعت پس از دریافت، فرآیند تکمیل شود \n" +
          `http://localhost:3000/reset/${token} \n \n` +
          "اگر این را درخواست نکردید، لطفاً این ایمیل را نادیده بگیرید و رمز عبور شما بدون تغییر باقی خواهد ماند. \n",
      };
      console.log("sending mail");
      transporter.sendMail(mailOption, (err, response) => {
        if (err) {
          console.error("there was an error", err);
        } else {
          console.log("here is the res :", response);
          res.status(200).json("recovery email send");
        }
      });
    }
  });
});
userRouter.get(
  "/reset/:resetPasswordToken",
  expressAsyncHandler(async (req, res, next) => {
    console.log(req.params.resetPasswordToken);
    const users = await User.findOne({
      resetPasswordToken: req.params.resetPasswordToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });
    console.log(users);
    if (users == null) {
      console.log("password reset link is invalid or has expired");
      res.json("password reset link is invalid orhas expired");
    } else {
      res.status(200).send({
        username: users.accName,
        message: "password reset link a-ok",
      });
    }
  })
);
userRouter.post("/updatePasswordViaEmail", async (req, res) => {
  const userss = await User.findOne({
    accName: req.body.username,
  });
  console.log(userss);
  if (userss) {
    console.log("users exists in db");
    const hashedPassword = bcrypt.hashSync(req.body.password);
    const updated = (hashedPassword) => {
      console.log(userss);
      User.findOneAndUpdate(
        { accName: req.body.username },
        {
          password: hashedPassword,
          resetPasswordToken: "",
          resetPasswordExpires: 0,
        }
      )
        .then(res.send({ message: "change shod !" }))
        .catch((error) => {
          console.log(error, "error");
        });
      console.log("password updated");
      res.status(200).send({ message: "password updated" });
    };
    updated();
  } else {
    console.log("no user exists in db to update");
    res.status(404).json("no user exists in db to update");
  }
});
userRouter.post("/editProfile", async (req, res) => {
  const user = await User.findOneAndUpdate(
    { accName: req.body.accName },
    {
      name: req.body.name,
      familyName: req.body.familyName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
    }
  );
  if (user) {
    res.send({
      message: "update shod !",
      name,
      familyName,
      phoneNumber,
      email,
    });
  } else {
    res.status(404).send({ message: "update failed shod !" });
  }
});
userRouter.get("/UserInfo/:accName", async (req, res) => {
  const userData = await User.findOne({ accName: req.params.accName });
  res.send({ _id: userData._id });
});
export default userRouter;
