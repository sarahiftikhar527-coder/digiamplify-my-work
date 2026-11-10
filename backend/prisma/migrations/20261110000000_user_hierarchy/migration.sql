-- AlterTable
ALTER TABLE `users` ADD COLUMN `managerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `users_managerId_idx` ON `users`(`managerId`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;