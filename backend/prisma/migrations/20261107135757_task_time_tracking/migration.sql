-- AlterTable
ALTER TABLE `task_daily_updates` ADD COLUMN `timeSpentMinutes` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `startedAt` DATETIME(3) NULL,
    ADD COLUMN `timeSpentMinutes` INTEGER NOT NULL DEFAULT 0;
