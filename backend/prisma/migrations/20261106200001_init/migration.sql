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
ALTER TABLE `calendars` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `chats` MODIFY `lastMessageText` TEXT NULL;

-- AlterTable
ALTER TABLE `finances` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `leaves` MODIFY `remarks` TEXT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `details` TEXT NULL,
    MODIFY `link` TEXT NULL;

-- AlterTable
ALTER TABLE `profiles` MODIFY `currentAddress` TEXT NULL,
    MODIFY `permanentAddress` TEXT NULL,
    MODIFY `avatarUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `progress_reports` MODIFY `accomplishments` TEXT NULL,
    MODIFY `blockers` TEXT NULL,
    MODIFY `nextSteps` TEXT NULL,
    MODIFY `adminFeedback` TEXT NULL;

-- AlterTable
ALTER TABLE `tasks` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `avatarUrl` TEXT NULL;
