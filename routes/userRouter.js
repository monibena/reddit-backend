import { prisma } from "../index.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const userRouter = express.Router();

// POST/users/register
// POST/users/login
// GET/users/token

userRouter.post("/register", async (req, res) => {
  //i want to see the username and pswd right here from thunderclient request
  const { username, password } = req.body;

  try {
    //make sure both username and password are entered
    if (!username || !password) {
      return res.send({
        success: false,
        error: "You need a username and password to register.",
      });
    }

    //check if user already exists?
    const checkUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    console.log(checkUser); //no user exits

    //if username already exists...
    if (checkUser) {
      return res.send({
        success: false,
        error: "Username already exists, please login.",
      });
    }

    //hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //console.log(hashedPassword);

    //Ask the Database to create a user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    //does not send the password, instead it gets deleted
    //delete user.password;

    //console.log(process.env.JWT_SECRET);

    //we want to generate the JWT(Jason Web Token)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.send({
      success: true,
      token,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//--------------------------------------------------------------------------------

userRouter.post("/login", async (req, res) => {
  //i want to see the username and pswd right here from thunderclient request
  const { username, password } = req.body;
  //console.log(username, password);

  try {
    //make sure both username and password are entered
    if (!username || !password) {
      return res.send({
        success: false,
        error: "You need a username and password to login.",
      });
    }

    //check if user already exists?
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    //console.log(checkUser); //no user exits

    //if username doesn't exist...
    if (!user) {
      return res.send({
        success: false,
        error: "You must create an account to log in.",
      });
    }

    //does not send the password, instead it gets deleted
    //delete user.password;

    //console.log(process.env.JWT_SECRET);

    //we need to creat a token
    //password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.send({
        success: false,
        error: "User and/or password is invalid.",
      });
    }

    //we want to generate the JWT(Jason Web Token)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.send({
      success: true,
      token,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.user,
    });
  }
});

//how can I respond to a request at GET/users/token
//saying will send use info if token is valid
userRouter.get("/token", async (req, res) => {
  //
  try {
    //if no token is provided
    if (!req.headers.authorization) {
      return res.send({
        success: false,
        error: "Invalid token used.",
      });
    }
    if (!req.user) {
      return res.send({
        success: false,
        error: "Please login.",
      });
    }

    res.send({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
