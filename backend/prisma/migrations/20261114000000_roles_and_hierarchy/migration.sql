ALTER TABLE `users`
ADD COLUMN `position` VARCHAR(50) NOT NULL DEFAULT 'employee';

CREATE INDEX `users_position_idx` ON `users`(`position`);