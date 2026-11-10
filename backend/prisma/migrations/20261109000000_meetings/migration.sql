-- CreateTable
CREATE TABLE `meetings` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `agenda` TEXT NULL,
    `notes` TEXT NULL,
    `meetingType` VARCHAR(20) NOT NULL DEFAULT 'online',
    `category` VARCHAR(30) NOT NULL DEFAULT 'general',
    `priority` VARCHAR(20) NOT NULL DEFAULT 'normal',
    `location` VARCHAR(255) NOT NULL DEFAULT '',
    `meetingLink` VARCHAR(500) NOT NULL DEFAULT '',
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `tzOffset` INTEGER NOT NULL DEFAULT 0,
    `recurrence` VARCHAR(20) NOT NULL DEFAULT 'none',
    `recurrenceUntil` DATETIME(3) NULL,
    `skippedDates` JSON NULL,
    `reminderMinutes` INTEGER NOT NULL DEFAULT 15,
    `lastReminderFor` DATETIME(3) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    `cancelReason` VARCHAR(500) NOT NULL DEFAULT '',
    `organizerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `meetings_startAt_endAt_idx`(`startAt`, `endAt`),
    INDEX `meetings_organizerId_startAt_idx`(`organizerId`, `startAt`),
    INDEX `meetings_status_startAt_idx`(`status`, `startAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_attendees` (
    `id` VARCHAR(191) NOT NULL,
    `meetingId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rsvp` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `respondedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `meeting_attendees_userId_idx`(`userId`),
    UNIQUE INDEX `meeting_attendees_meetingId_userId_key`(`meetingId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_attendees` ADD CONSTRAINT `meeting_attendees_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_attendees` ADD CONSTRAINT `meeting_attendees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;