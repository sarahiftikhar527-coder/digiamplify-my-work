-- CreateTable
CREATE TABLE `profile_change_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `changes` JSON NOT NULL,
    `previous` JSON NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewNote` VARCHAR(500) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `profile_change_requests_userId_status_idx`(`userId`, `status`),
    INDEX `profile_change_requests_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profile_change_requests` ADD CONSTRAINT `profile_change_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_change_requests` ADD CONSTRAINT `profile_change_requests_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;