import express from "express";
import { prisma } from "../index.js";
export const postRouter = express.Router();

// GET /posts
// POST/posts
// PUT/ posts/:postId
// DELETE/posts/:postId

postRouter.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        subreddit: true,
        upvotes: true,
        downvotes: true,
        children: true, //{
        //   include: {
        //     user: true,
        //   },
        // },
      },
    });
    res.send({ success: true, posts });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//GET request for a single POST
postRouter.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: true,
        subreddit: true,
        upvotes: true,
        downvotes: true,
        children: true,
      },
    });
    res.send({
      success: true,
      post,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//POST request
postRouter.post("/", async (req, res) => {
  //grab title, text
  const { title, text, subredditId, parentId } = req.body;
  //console.log(title, text, subredditId);

  //!(post) to check if the post doesn't exist

  try {
    //check for /text/subredditID
    if (!text) {
      return res.send({
        success: false,
        error: "Text must be provided to create a post.",
      });
    }

    //Should I check to see for subredditId????
    if (!subredditId) {
      return res.send({
        success: false,
        error: "subreddit Id must be provided.",
      });
    }

    if (!req.user) {
      return res.send({
        success: false,
        error: "You must be logged in to create a submission.",
      });
    }

    //we need to know the user info.
    //console.log(req.user);

    //ask the database to create a post
    const post = await prisma.post.create({
      data: {
        title,
        text,
        subredditId,
        parentId,
        userId: req.user.id,
      },
    });

    res.send({ success: true, posts: post });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// PUT/ posts/:postId
postRouter.put("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { title, text } = req.body;
  //console.log(postId);

  if (!text) {
    return res.send({
      success: false,
      error: "You must provide text.",
    });
  }
  console.log(text);

  try {
    //retrieves post from the DB
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    //checks to see if the post exists
    if (!post) {
      return res.send({
        success: false,
        error: "Post not found.",
      });
    }

    //if the post creator is not the same user requesting to update the post, return success: false
    if (post.userId !== req.user.id) {
      return res.send({
        success: false,
        error: "You must login to update this post.",
      });
    }

    //if the same user than update the post
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title,
        text,
        userId: req.user.id,
      },
    });
    res.send({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// DELETE/posts/:postId
postRouter.delete("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    //login error handling
    if (!req.user) {
      return res.send({
        success: false,
        error: "You must be logged in to delete a post.",
      });
    }

    //looks for post by id
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    //checks to see if the post exists
    if (!post) {
      return res.send({
        success: false,
        error: "Post not found.",
      });
    }

    //if the post creator is not the same user requesting to delete the post, return success: false
    if (post.userId !== req.user.id) {
      return res.send({
        success: false,
        error: "User not authorized to delete this post.",
      });
    }

    //should user be able to delete post regardless of the amounts of upvotes/downvotes it has???????
    const deletedPost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.send({
      success: true,
      deletedPost,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
