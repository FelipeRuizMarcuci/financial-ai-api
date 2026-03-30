-- AlterTable
ALTER TABLE `user` ADD COLUMN `token` VARCHAR(191) NULL,
    ADD COLUMN `tokenExpireAt` DATETIME(3) NULL;
