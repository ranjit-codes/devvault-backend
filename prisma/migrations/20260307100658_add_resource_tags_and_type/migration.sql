-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'ARTICLE';
