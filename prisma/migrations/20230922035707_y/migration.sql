/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Subreddit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subreddit_name_key" ON "Subreddit"("name");
