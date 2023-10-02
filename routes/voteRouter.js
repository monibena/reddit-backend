import { prisma } from "../index.js";
import express from "express";
export const voteRouter = express.Router();

// POST/votes/upvotes/:postId
// POST/votes/downvotes/:postId
// DELETE/votes/upvotes/:postId
// DELETE/votes/downvotes/:postId

voteRouter.post("/upvotes/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    if (!req.headers.authorization) {
      return res.send({
        success: false,
        error: "Invalid token used.",
      });
    }

    if (!req.user) {
      return res.send({
        success: false,
        error: "You must be logged in to like a post.",
      });
    }

    const upVote = await prisma.upvote.create({
      data: {
        postId,
        userId: req.user.id,
      },
    });

    res.send({
      success: true,
      upVote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//delete upvote that matches both the userId and postId
voteRouter.delete("/upvotes/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    // const findUpVote = await prisma.upvote.findUnique({
    //   where: {
    //     userId: req.user.id,
    //     postId,
    //   },
    // });

    // if (!findUpVote) {
    //   return res.send({
    //     success: false,
    //     error: "Upvote not found for authorized user.",
    //   });
    // }

    const upVote = await prisma.upvote.delete({
      where: {
        //has to match criteria
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });
    res.send({
      success: true,
      upVote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//------------------------------------------------------------------------
voteRouter.post("/downvotes/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    // const post = await prisma.upvote.findUnique({
    //   where: {
    //     id: postId,
    //   },
    // });

    // if (!post) {
    //   return res.send({
    //     success: false,
    //     error: "Post not found",
    //   });
    // }
    if (!req.headers.authorization) {
      return res.send({
        success: false,
        error: "Invalid token used.",
      });
    }

    if (!req.user) {
      return res.send({
        success: false,
        error: "You must be logged in to like a post.",
      });
    }

    const downVote = await prisma.downvote.create({
      data: {
        postId,
        userId: req.user.id,
      },
    });

    res.send({
      success: true,
      downVote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//delete upvote that matches both the userId and postId
voteRouter.delete("/downvotes/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    // const findUpVote = await prisma.upvote.findUnique({
    //   where: {
    //     userId: req.user.id,
    //     postId,
    //   },
    // });

    // if (!findUpVote) {
    //   return res.send({
    //     success: false,
    //     error: "Upvote not found for authorized user.",
    //   });
    // }

    const downVote = await prisma.downvote.delete({
      where: {
        //has to match criteria
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });
    res.send({
      success: true,
      downVote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
