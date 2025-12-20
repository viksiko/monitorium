/*
  Warnings:

  - You are about to drop the column `verifyExp` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verifyToken` on the `users` table. All the data in the column will be lost.
  - Added the required column `type` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('REFRESH', 'VERIFY_EMAIL', 'RESET_PASSWORD');

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "type" "TokenType" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "verifyExp",
DROP COLUMN "verifyToken";
