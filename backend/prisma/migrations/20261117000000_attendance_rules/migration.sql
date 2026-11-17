-- CreateTable
CREATE TABLE `attendance_rules` (
    `id` VARCHAR(191) NOT NULL,
    `teaMinutes` INTEGER NOT NULL DEFAULT 15,
    `lunchMinutes` INTEGER NOT NULL DEFAULT 30,
    `prayerMinutes` INTEGER NOT NULL DEFAULT 15,
    `otherMinutes` INTEGER NOT NULL DEFAULT 15,
    `dailyTargetMinutes` INTEGER NOT NULL DEFAULT 480,
    `workDays` VARCHAR(20) NOT NULL DEFAULT '1,2,3,4,5',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_schedules` (
    `userId` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(10) NOT NULL DEFAULT '',
    `endTime` VARCHAR(10) NOT NULL DEFAULT '',
    `dailyTargetMinutes` INTEGER NULL,
    `workDays` VARCHAR(20) NOT NULL DEFAULT '1,2,3,4,5',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;