import { PrismaClient } from "@prisma/client";
import express from "express";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { postRouter } from "./routes/postRouter.js";
import { subredditRouter } from "./routes/subredditRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { voteRouter } from "./routes/voteRouter.js";
dotenv.config();
import cors from "cors";

export const prisma = new PrismaClient();

const app = express();
app.use(cors());

app.use(express.json()); //tells express to expect json and convrt it to an object

//we want an auth middleware that fires before every request and checks
//if theres a token and checks if that token is valid and grabs
//the user info and stores it in req.user
//logged in back end? req.user -->has user user info and is considered logged in

//every other endpooint after this, req.user will exist if there is a token and its valid
app.use(async (req, res, next) => {
  //console.log("request coming in");

  //check if theres an auth token in header and console it
  //console.log(req.headers.authorization);

  try {
    if (!req.headers.authorization) {
      return next();
    }
    const token = req.headers.authorization.split(" ")[1];

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(userId);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    // console.log(userId);

    if (!user) {
      return next();
    }

    delete user.password;
    req.user = user;
    //console.log(req.user);

    next();
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.use("/posts", postRouter);
app.use("/subreddits", subredditRouter);
app.use("/users", userRouter);
app.use("/votes", voteRouter);

// GET request
app.get("/", (req, res) => {
  res.send({ sucess: true, message: "Welcome to the Reddit server!" });
});

//error handling
app.use((req, res) => {
  res.send({ success: false, error: "No route found!" });
});

app.use((error, req, res, next) => {
  res.send({ success: false, error: error.post });
});

const port = 3000;

app.listen(port, () => {
  console.log("App listening on port ${port}");
});
