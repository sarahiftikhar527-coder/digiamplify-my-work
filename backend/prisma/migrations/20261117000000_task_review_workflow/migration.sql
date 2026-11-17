-- AlterTable
ALTER TABLE `tasks`
    ADD COLUMN `submissionNote` TEXT NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewNote` TEXT NULL,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` VARCHAR(191) NULL,
    ADD COLUMN `reviewedByName` VARCHAR(150) NULL;