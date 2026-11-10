/*
  Warnings:

  - Made the column `description` on table `calendars` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastMessageText` on table `chats` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notes` on table `finances` required. This step will fail if there are existing NULL values in that column.
  - Made the column `remarks` on table `leaves` required. This step will fail if there are existing NULL values in that column.
  - Made the column `details` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `link` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentAddress` on table `profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `permanentAddress` on table `profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatarUrl` on table `profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accomplishments` on table `progress_reports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `blockers` on table `progress_reports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nextSteps` on table `progress_reports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `adminFeedback` on table `progress_reports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `tasks` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatarUrl` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `calendars` MODIFY `description` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `chats` MODIFY `lastMessageText` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `finances` MODIFY `notes` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `leaves` MODIFY `remarks` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `notifications` MODIFY `details` TEXT NOT NULL DEFAULT '',
    MODIFY `link` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `profiles` MODIFY `currentAddress` TEXT NOT NULL DEFAULT '',
    MODIFY `permanentAddress` TEXT NOT NULL DEFAULT '',
    MODIFY `avatarUrl` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `progress_reports` MODIFY `accomplishments` TEXT NOT NULL DEFAULT '',
    MODIFY `blockers` TEXT NOT NULL DEFAULT '',
    MODIFY `nextSteps` TEXT NOT NULL DEFAULT '',
    MODIFY `adminFeedback` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `tasks` MODIFY `description` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `users` MODIFY `avatarUrl` TEXT NOT NULL DEFAULT '';
