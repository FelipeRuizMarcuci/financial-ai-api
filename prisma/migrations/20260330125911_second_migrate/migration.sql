-- AlterTable
ALTER TABLE `goals` ADD COLUMN `deleted` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `deleted` INTEGER NOT NULL DEFAULT 0;
