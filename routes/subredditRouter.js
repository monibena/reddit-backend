import express from "express";
import { prisma } from "../index.js";
export const subredditRouter = express.Router();

// GET/subreddits/
// POST/ subreddits
// DELETE/ subreddits/:subredditId

// GET /subreddits/
// Request: fetch(`${API}/subreddits/`);

subredditRouter.get("/", async (req, res) => {
  try {
    const subreddits = await prisma.subreddit.findMany();
    res.send({
      success: true,
      subreddits,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//--------------------------------------------------------------------------

// POST/ subreddits
subredditRouter.post("/", async (req, res) => {
  const { name } = req.body;

  //error handling
  try {
    if (!name) {
      return res.send({
        success: false,
        error: "You must provide a Subreddit name.",
      });
    }

    if (!req.user) {
      return res.send({
        success: false,
        error: "User must be logged in to create a Subreddit.",
      });
    }

    const subreddit = await prisma.subreddit.create({
      data: {
        name,
        userId: req.user.id,
      },
    });

    res.send({
      success: true,
      subreddit,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//------------------------------------------------------------------------
//DELETE /subreddits/:subredditId
//Should we be able to delete subreddits?

subredditRouter.delete("/:subredditId", async (req, res) => {
  const { subredditId } = req.params;

  try {
    //looks for subreddit by id
    const subreddit = await prisma.subreddit.findUnique({
      where: {
        id: subredditId,
      },
    });

    //checks to see if the subreddit exists
    if (!subreddit) {
      return res.send({
        success: false,
        error: "Subreddit not found.",
      });
    }

    //if the subreddit creator is not the same user requesting to delete the subreddit, return success: false
    if (subreddit.userId !== req.user.id) {
      return res.send({
        success: false,
        error: "User not authorized to delete this subreddit.",
      });
    }

    //if subreddit creater is the same user requesting to delete the subreddit, proceed
    const deletedSubreddit = await prisma.subreddit.delete({
      where: {
        id: subredditId,
      },
    });

    res.send({
      success: true,
      deletedSubreddit,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
