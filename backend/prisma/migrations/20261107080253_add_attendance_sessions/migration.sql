-- CreateTable
CREATE TABLE `attendance_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dateKey` VARCHAR(50) NOT NULL,
    `clockInAt` DATETIME(3) NOT NULL,
    `clockOutAt` DATETIME(3) NULL,
    `workedMinutes` INTEGER NOT NULL DEFAULT 0,
    `breakMinutes` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(500) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `attendance_sessions_userId_dateKey_idx`(`userId`, `dateKey`),
    INDEX `attendance_sessions_dateKey_idx`(`dateKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_breaks` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dateKey` VARCHAR(50) NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NULL,
    `minutes` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `attendance_breaks_userId_dateKey_idx`(`userId`, `dateKey`),
    INDEX `attendance_breaks_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `attendance_breaks` ADD CONSTRAINT `attendance_breaks_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `attendance_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
