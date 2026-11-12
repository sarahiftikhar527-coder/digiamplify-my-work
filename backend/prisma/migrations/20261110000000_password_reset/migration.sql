-- AlterTable
ALTER TABLE `users`
    ADD COLUMN `passwordResetTokenHash` VARCHAR(255) NULL,
    ADD COLUMN `passwordResetExpires` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `users_passwordResetTokenHash_idx` ON `users`(`passwordResetTokenHash`);