-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'employee',
    `phone` VARCHAR(50) NOT NULL DEFAULT '',
    `department` VARCHAR(100) NOT NULL DEFAULT '',
    `designation` VARCHAR(100) NOT NULL DEFAULT '',
    `avatarUrl` TEXT NOT NULL DEFAULT '',
    `timeZone` VARCHAR(100) NOT NULL DEFAULT 'UTC',
    `status` VARCHAR(50) NOT NULL DEFAULT 'active',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `pinHash` VARCHAR(255) NULL,
    `pinResetTokenHash` VARCHAR(255) NULL,
    `pinResetExpires` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL DEFAULT '',
    `userName` VARCHAR(191) NOT NULL DEFAULT '',
    `dob` VARCHAR(50) NOT NULL DEFAULT '',
    `gender` VARCHAR(50) NOT NULL DEFAULT '',
    `nationality` VARCHAR(100) NOT NULL DEFAULT '',
    `language` VARCHAR(100) NOT NULL DEFAULT '',
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `workEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `phone` VARCHAR(50) NOT NULL DEFAULT '',
    `emergencyNumber` VARCHAR(50) NOT NULL DEFAULT '',
    `currentAddress` TEXT NOT NULL DEFAULT '',
    `permanentAddress` TEXT NOT NULL DEFAULT '',
    `country` VARCHAR(100) NOT NULL DEFAULT '',
    `city` VARCHAR(100) NOT NULL DEFAULT '',
    `education` VARCHAR(191) NOT NULL DEFAULT '',
    `bankName` VARCHAR(191) NOT NULL DEFAULT '',
    `annualSalary` DOUBLE NOT NULL DEFAULT 0,
    `accountHolder` VARCHAR(191) NOT NULL DEFAULT '',
    `salaryType` VARCHAR(50) NOT NULL DEFAULT 'Monthly',
    `accountNumber` VARCHAR(100) NOT NULL DEFAULT '',
    `salary` DOUBLE NOT NULL DEFAULT 0,
    `currency` VARCHAR(50) NOT NULL DEFAULT 'Rupees',
    `deductionPerAbsence` DOUBLE NOT NULL DEFAULT 0,
    `bonus` DOUBLE NOT NULL DEFAULT 0,
    `salaryPaymentDate` VARCHAR(50) NOT NULL DEFAULT '',
    `jobTitle` VARCHAR(100) NOT NULL DEFAULT '',
    `department` VARCHAR(100) NOT NULL DEFAULT '',
    `team` VARCHAR(100) NOT NULL DEFAULT '',
    `manager` VARCHAR(100) NOT NULL DEFAULT '',
    `jobLevel` VARCHAR(50) NOT NULL DEFAULT 'Junior',
    `probationPeriod` VARCHAR(50) NOT NULL DEFAULT '',
    `dateOfJoining` VARCHAR(50) NOT NULL DEFAULT '',
    `confirmationDate` VARCHAR(50) NOT NULL DEFAULT '',
    `annualLeave` INTEGER NOT NULL DEFAULT 0,
    `jobType` VARCHAR(50) NOT NULL DEFAULT 'Full Time',
    `workType` VARCHAR(50) NOT NULL DEFAULT 'Remote',
    `shift` VARCHAR(50) NOT NULL DEFAULT 'Day Shift',
    `workingDays` JSON NULL,
    `weeklyOff` VARCHAR(50) NOT NULL DEFAULT 'Sunday',
    `noticePeriod` VARCHAR(50) NOT NULL DEFAULT '',
    `avatarUrl` TEXT NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile_documents` (
    `id` VARCHAR(191) NOT NULL,
    `profileId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(100) NOT NULL,
    `label` VARCHAR(191) NOT NULL DEFAULT '',
    `kind` VARCHAR(50) NOT NULL DEFAULT 'file',
    `fileName` VARCHAR(255) NOT NULL DEFAULT '',
    `url` TEXT NOT NULL DEFAULT '',
    `backFileName` VARCHAR(255) NOT NULL DEFAULT '',
    `backUrl` TEXT NOT NULL DEFAULT '',
    `uploadedOn` VARCHAR(50) NOT NULL DEFAULT '',
    `status` VARCHAR(50) NOT NULL DEFAULT 'missing',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `profile_documents_profileId_idx`(`profileId`),
    INDEX `profile_documents_fileName_idx`(`fileName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(255) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `refresh_tokens_tokenHash_key`(`tokenHash`),
    INDEX `refresh_tokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dateKey` VARCHAR(50) NOT NULL,
    `clockInAt` DATETIME(3) NULL,
    `clockOutAt` DATETIME(3) NULL,
    `workedMinutes` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(50) NOT NULL DEFAULT 'incomplete',
    `description` VARCHAR(500) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `attendances_dateKey_status_idx`(`dateKey`, `status`),
    UNIQUE INDEX `attendances_userId_dateKey_key`(`userId`, `dateKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `assignedById` VARCHAR(191) NULL,
    `startDate` VARCHAR(50) NOT NULL,
    `endDate` VARCHAR(50) NOT NULL,
    `startTime` VARCHAR(50) NOT NULL,
    `endTime` VARCHAR(50) NOT NULL,
    `breakStart` VARCHAR(50) NOT NULL DEFAULT '',
    `breakEnd` VARCHAR(50) NOT NULL DEFAULT '',
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `shift_assignments_employeeId_startDate_endDate_idx`(`employeeId`, `startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leaves` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `from` VARCHAR(50) NOT NULL,
    `to` VARCHAR(50) NOT NULL,
    `days` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `remarks` TEXT NOT NULL DEFAULT '',
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `appliedOn` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `leaves_employeeId_idx`(`employeeId`),
    INDEX `leaves_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `subtitle` VARCHAR(200) NOT NULL DEFAULT '',
    `description` TEXT NOT NULL DEFAULT '',
    `priority` VARCHAR(50) NOT NULL DEFAULT 'Medium',
    `assignedToId` VARCHAR(191) NOT NULL,
    `assignedById` VARCHAR(191) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `dueDate` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tasks_assignedToId_status_dueDate_idx`(`assignedToId`, `status`, `dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendars` (
    `id` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(50) NOT NULL,
    `title` VARCHAR(200) NOT NULL DEFAULT '',
    `employeeId` VARCHAR(191) NULL,
    `employeeName` VARCHAR(100) NOT NULL DEFAULT '',
    `role` VARCHAR(100) NOT NULL DEFAULT '',
    `from` DATETIME(3) NOT NULL,
    `to` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(50) NOT NULL DEFAULT '',
    `endTime` VARCHAR(50) NOT NULL DEFAULT '',
    `clockIn` VARCHAR(50) NOT NULL DEFAULT '',
    `clockOut` VARCHAR(50) NOT NULL DEFAULT '',
    `worked` VARCHAR(50) NOT NULL DEFAULT '',
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `description` TEXT NOT NULL DEFAULT '',
    `createdById` VARCHAR(191) NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `calendars_from_to_eventType_idx`(`from`, `to`, `eventType`),
    INDEX `calendars_employeeId_from_idx`(`employeeId`, `from`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chats` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'direct',
    `name` VARCHAR(100) NOT NULL DEFAULT '',
    `createdById` VARCHAR(191) NOT NULL,
    `lastMessageAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastMessageText` TEXT NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_members` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `lastReadAt` DATETIME(3) NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_members_userId_idx`(`userId`),
    UNIQUE INDEX `chat_members_chatId_userId_key`(`chatId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL DEFAULT '',
    `attachments` JSON NULL,
    `mentions` JSON NULL,
    `replyTo` VARCHAR(100) NULL,
    `forwardedFrom` VARCHAR(100) NULL,
    `reactions` JSON NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `readBy` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chat_messages_chatId_createdAt_idx`(`chatId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_cleared` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `clearedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chat_cleared_chatId_userId_key`(`chatId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finances` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `salary` DOUBLE NOT NULL,
    `bonus` DOUBLE NOT NULL DEFAULT 0,
    `deduction` DOUBLE NOT NULL DEFAULT 0,
    `department` VARCHAR(100) NOT NULL DEFAULT '',
    `bank` VARCHAR(100) NOT NULL DEFAULT '',
    `account` VARCHAR(100) NOT NULL DEFAULT '',
    `paymentDate` DATETIME(3) NULL,
    `periodMonth` INTEGER NOT NULL,
    `periodYear` INTEGER NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `notes` TEXT NOT NULL DEFAULT '',
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `finances_status_idx`(`status`),
    UNIQUE INDEX `finances_employeeId_periodYear_periodMonth_key`(`employeeId`, `periodYear`, `periodMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `toId` VARCHAR(191) NOT NULL,
    `fromId` VARCHAR(191) NULL,
    `type` VARCHAR(50) NOT NULL,
    `tag` VARCHAR(50) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `details` TEXT NOT NULL DEFAULT '',
    `link` TEXT NOT NULL DEFAULT '',
    `linkLabel` VARCHAR(100) NOT NULL DEFAULT '',
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notifications_toId_createdAt_idx`(`toId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `on` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_preferences_userId_key_key`(`userId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `company` VARCHAR(200) NOT NULL DEFAULT '',
    `projectType` VARCHAR(120) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsletter_subscribers` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `unsubscribeTokenHash` VARCHAR(255) NOT NULL,
    `subscribedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unsubscribedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `newsletter_subscribers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcements` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `audience` VARCHAR(50) NOT NULL DEFAULT 'all',
    `priority` VARCHAR(50) NOT NULL DEFAULT 'normal',
    `status` VARCHAR(50) NOT NULL DEFAULT 'published',
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `announcements_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcement_recipients` (
    `id` VARCHAR(191) NOT NULL,
    `announcementId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `announcement_recipients_announcementId_employeeId_key`(`announcementId`, `employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progress_reports` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `summary` TEXT NOT NULL,
    `accomplishments` TEXT NOT NULL DEFAULT '',
    `blockers` TEXT NOT NULL DEFAULT '',
    `nextSteps` TEXT NOT NULL DEFAULT '',
    `status` VARCHAR(50) NOT NULL DEFAULT 'submitted',
    `adminFeedback` TEXT NOT NULL DEFAULT '',
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `progress_reports_status_idx`(`status`),
    UNIQUE INDEX `progress_reports_employeeId_periodStart_key`(`employeeId`, `periodStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_documents` ADD CONSTRAINT `profile_documents_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift_assignments` ADD CONSTRAINT `shift_assignments_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift_assignments` ADD CONSTRAINT `shift_assignments_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaves` ADD CONSTRAINT `leaves_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaves` ADD CONSTRAINT `leaves_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendars` ADD CONSTRAINT `calendars_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendars` ADD CONSTRAINT `calendars_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendars` ADD CONSTRAINT `calendars_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_members` ADD CONSTRAINT `chat_members_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_members` ADD CONSTRAINT `chat_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_cleared` ADD CONSTRAINT `chat_cleared_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finances` ADD CONSTRAINT `finances_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finances` ADD CONSTRAINT `finances_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finances` ADD CONSTRAINT `finances_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_toId_fkey` FOREIGN KEY (`toId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_fromId_fkey` FOREIGN KEY (`fromId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcement_recipients` ADD CONSTRAINT `announcement_recipients_announcementId_fkey` FOREIGN KEY (`announcementId`) REFERENCES `announcements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcement_recipients` ADD CONSTRAINT `announcement_recipients_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progress_reports` ADD CONSTRAINT `progress_reports_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progress_reports` ADD CONSTRAINT `progress_reports_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

