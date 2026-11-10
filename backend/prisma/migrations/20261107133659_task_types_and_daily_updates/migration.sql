-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `taskType` VARCHAR(20) NOT NULL DEFAULT 'extra';

-- CreateTable
CREATE TABLE `task_daily_updates` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `updateDate` VARCHAR(10) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'in-progress',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `task_daily_updates_employeeId_updateDate_idx`(`employeeId`, `updateDate`),
    UNIQUE INDEX `task_daily_updates_taskId_updateDate_key`(`taskId`, `updateDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `tasks_taskType_isActive_idx` ON `tasks`(`taskType`, `isActive`);

-- AddForeignKey
ALTER TABLE `task_daily_updates` ADD CONSTRAINT `task_daily_updates_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
