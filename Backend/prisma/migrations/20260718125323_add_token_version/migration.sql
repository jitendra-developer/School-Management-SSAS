-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;
