-- CreateEnum
CREATE TYPE "ManualArticleStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChecklistFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'ON_DEMAND');

-- CreateTable
CREATE TABLE "manual_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_articles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentHtml" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ManualArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_revisions" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changeNote" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_acknowledgments" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signature" TEXT,

    CONSTRAINT "manual_acknowledgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_checklists" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "articleId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "ChecklistFrequency" NOT NULL DEFAULT 'ON_DEMAND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_checklist_items" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "manual_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_checklist_executions" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "executedBy" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "items" JSONB NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "manual_checklist_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manual_categories_tenantId_slug_key" ON "manual_categories"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "manual_articles_tenantId_categoryId_slug_key" ON "manual_articles"("tenantId", "categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "manual_acknowledgments_articleId_employeeId_key" ON "manual_acknowledgments"("articleId", "employeeId");

-- AddForeignKey
ALTER TABLE "manual_categories" ADD CONSTRAINT "manual_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_categories" ADD CONSTRAINT "manual_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "manual_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_articles" ADD CONSTRAINT "manual_articles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_articles" ADD CONSTRAINT "manual_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "manual_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_revisions" ADD CONSTRAINT "manual_revisions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "manual_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_acknowledgments" ADD CONSTRAINT "manual_acknowledgments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "manual_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_acknowledgments" ADD CONSTRAINT "manual_acknowledgments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_checklists" ADD CONSTRAINT "manual_checklists_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_checklists" ADD CONSTRAINT "manual_checklists_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "manual_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_checklist_items" ADD CONSTRAINT "manual_checklist_items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "manual_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_checklist_executions" ADD CONSTRAINT "manual_checklist_executions_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "manual_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
