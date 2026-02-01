-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'PARTNER');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID');

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'ADMIN', 'HR_MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'APPRENTICE', 'INTERNSHIP', 'FIXED_TERM', 'FREELANCE');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'PROBATION', 'TERMINATED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CONTRACT', 'ID_DOCUMENT', 'TRAINING_CERTIFICATE', 'MEDICAL_CERTIFICATE', 'DPI_RECEIPT', 'PAYSLIP', 'DISCIPLINARY', 'GDPR_CONSENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DeadlineType" AS ENUM ('TRAINING_EXPIRY', 'MEDICAL_VISIT', 'DPI_RENEWAL', 'CONTRACT_EXPIRY', 'PROBATION_END', 'DOCUMENT_EXPIRY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('PENDING', 'UPCOMING', 'OVERDUE', 'COMPLETED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'COMPLETED', 'ACKNOWLEDGED');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'DPA', 'COOKIE_POLICY');

-- CreateEnum
CREATE TYPE "GdprConsentType" AS ENUM ('DATA_PROCESSING', 'HEALTH_DATA', 'MARKETING', 'THIRD_PARTY_SHARING', 'PHOTO_VIDEO');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT', 'CONSENT_GRANTED', 'CONSENT_REVOKED', 'DOCUMENT_SIGNED');

-- CreateEnum
CREATE TYPE "SafetyTrainingType" AS ENUM ('GENERAL', 'SPECIFIC_LOW', 'SPECIFIC_MEDIUM', 'SPECIFIC_HIGH', 'FIRST_AID', 'FIRE_PREVENTION', 'RLS', 'PREPOSTO', 'DIRIGENTE', 'UPDATE');

-- CreateEnum
CREATE TYPE "SafetyTrainingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DisciplinaryInfractionType" AS ENUM ('TARDINESS', 'ABSENCE', 'INSUBORDINATION', 'NEGLIGENCE', 'MISCONDUCT', 'POLICY_VIOLATION', 'SAFETY_VIOLATION', 'HARASSMENT', 'THEFT', 'FRAUD', 'OTHER');

-- CreateEnum
CREATE TYPE "DisciplinarySanctionType" AS ENUM ('VERBAL_WARNING', 'WRITTEN_WARNING', 'FINE', 'SUSPENSION', 'DISMISSAL_NOTICE', 'DISMISSAL_IMMEDIATE', 'NO_SANCTION');

-- CreateEnum
CREATE TYPE "DisciplinaryStatus" AS ENUM ('DRAFT', 'CONTESTATION_SENT', 'AWAITING_DEFENSE', 'DEFENSE_RECEIVED', 'HEARING_SCHEDULED', 'PENDING_DECISION', 'SANCTION_ISSUED', 'APPEALED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisciplinaryDocType" AS ENUM ('CONTESTATION_LETTER', 'DEFENSE_LETTER', 'HEARING_MINUTES', 'SANCTION_LETTER', 'APPEAL', 'OTHER');

-- CreateEnum
CREATE TYPE "WhistleblowerType" AS ENUM ('ANONYMOUS', 'CONFIDENTIAL', 'IDENTIFIED');

-- CreateEnum
CREATE TYPE "WhistleblowingCategory" AS ENUM ('FRAUD', 'CORRUPTION', 'SAFETY_VIOLATION', 'ENVIRONMENTAL', 'DISCRIMINATION', 'HARASSMENT', 'DATA_BREACH', 'CONFLICT_OF_INTEREST', 'FINANCIAL_IRREGULARITY', 'OTHER');

-- CreateEnum
CREATE TYPE "WhistleblowingStatus" AS ENUM ('RECEIVED', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION', 'ADDITIONAL_INFO_REQUESTED', 'SUBSTANTIATED', 'UNSUBSTANTIATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "OnboardingPhase" AS ENUM ('OFFER_LETTER', 'DOCUMENTS_COLLECTION', 'BACKGROUND_CHECK', 'WELCOME', 'WORKSPACE_SETUP', 'IT_ACCOUNTS', 'BADGE_ACCESS', 'COMPANY_ORIENTATION', 'TEAM_INTRODUCTION', 'TOOLS_TRAINING', 'SAFETY_TRAINING_GENERAL', 'SAFETY_TRAINING_SPECIFIC', 'DPI_DELIVERY', 'DVR_ACKNOWLEDGMENT', 'EMERGENCY_PROCEDURES', 'PRIVACY_CONSENT', 'CONTRACT_SIGNING', 'DISCIPLINARY_CODE', 'CCNL_INFORMATION', 'PROBATION_REVIEW_30', 'PROBATION_REVIEW_60', 'PROBATION_FINAL', 'DATA_CHANGE_REQUEST');

-- CreateEnum
CREATE TYPE "OnboardingPhaseStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DataChangeType" AS ENUM ('PERSONAL_INFO', 'CONTACT_INFO', 'BANK_INFO', 'TAX_INFO', 'EMERGENCY_CONTACT', 'ADDRESS');

-- CreateEnum
CREATE TYPE "DataChangeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProbationResult" AS ENUM ('CONFIRMED', 'EXTENDED', 'TERMINATED', 'RESIGNED');

-- CreateEnum
CREATE TYPE "NoteCategory" AS ENUM ('GENERAL', 'PERFORMANCE', 'BEHAVIOR', 'MEETING', 'WARNING', 'POSITIVE', 'FEEDBACK');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'VIEWED', 'IN_PROGRESS', 'SIGNED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SignaturePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SignatureAction" AS ENUM ('DOCUMENT_OPENED', 'PAGE_VIEWED', 'SCROLLED', 'TIME_TRACKED', 'PASSWORD_ENTERED', 'PASSWORD_FAILED', 'OTP_REQUESTED', 'OTP_VERIFIED', 'OTP_FAILED', 'PHRASE_TYPED', 'PHRASE_VERIFIED', 'PHRASE_FAILED', 'SIGNED', 'REJECTED', 'CERTIFICATE_GENERATED', 'CERTIFICATE_DOWNLOADED');

-- CreateEnum
CREATE TYPE "TimeEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ANOMALY', 'AUTO_APPROVED');

-- CreateEnum
CREATE TYPE "TimeAnomalyType" AS ENUM ('MISSING_CLOCK_IN', 'MISSING_CLOCK_OUT', 'OUT_OF_ZONE', 'UNUSUAL_HOURS', 'OVERTIME_NOT_APPROVED', 'DUPLICATE_ENTRY');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'ROL', 'EX_FESTIVITY', 'PARENTAL', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'MARRIAGE', 'STUDY', 'BLOOD_DONATION', 'UNION', 'MEDICAL_VISIT', 'LAW_104', 'UNPAID', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('MILEAGE', 'TRAVEL', 'ACCOMMODATION', 'MEALS', 'TRANSPORT', 'PARKING', 'TOLL', 'FUEL', 'PHONE', 'SUPPLIES', 'TRAINING', 'CLIENT_GIFT', 'REPRESENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR_PETROL', 'CAR_DIESEL', 'CAR_HYBRID', 'CAR_ELECTRIC', 'CAR_LPG', 'CAR_METHANE', 'MOTORCYCLE', 'SCOOTER', 'BICYCLE');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL', 'SMS', 'TOTP');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DOCUMENT_TO_SIGN', 'DOCUMENT_SIGNED', 'DOCUMENT_REJECTED', 'DOCUMENT_REMINDER', 'LEAVE_REQUESTED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_REMINDER', 'EXPENSE_REQUESTED', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED', 'EXPENSE_PAID', 'ATTENDANCE_ANOMALY', 'ATTENDANCE_REMINDER', 'PAYSLIP_AVAILABLE', 'DEADLINE_REMINDER', 'DEADLINE_OVERDUE', 'SYSTEM_ALERT', 'WELCOME');

-- CreateEnum
CREATE TYPE "TutorialStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "secondaryColor" TEXT NOT NULL DEFAULT '#10b981',
    "customDomain" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'STARTER',
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Rome',
    "language" TEXT NOT NULL DEFAULT 'it',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentTenantId" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" "TenantRole" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fiscalCode" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "contractType" "ContractType" NOT NULL DEFAULT 'FULL_TIME',
    "ccnlLevel" TEXT,
    "department" TEXT,
    "jobTitle" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "probationEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "category" TEXT,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "retentionYears" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "DeadlineType" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "DeadlineStatus" NOT NULL DEFAULT 'PENDING',
    "notify30Days" BOOLEAN NOT NULL DEFAULT true,
    "notify60Days" BOOLEAN NOT NULL DEFAULT false,
    "notify90Days" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "reviewerId" TEXT,
    "technicalSkills" INTEGER,
    "teamwork" INTEGER,
    "communication" INTEGER,
    "reliability" INTEGER,
    "growthPotential" INTEGER,
    "overallScore" DOUBLE PRECISION,
    "strengths" TEXT,
    "improvements" TEXT,
    "goals" TEXT,
    "notes" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklist" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingItem" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "tenantId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "status" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "legalDocumentId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GdprConsent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "consentType" "GdprConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "purpose" TEXT,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "collectedBy" TEXT,
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GdprConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CookieConsent" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "userId" TEXT,
    "necessary" BOOLEAN NOT NULL DEFAULT true,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "preferences" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookieConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyTraining" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingType" "SafetyTrainingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "hoursCompleted" INTEGER NOT NULL DEFAULT 0,
    "hoursRequired" INTEGER NOT NULL,
    "provider" TEXT,
    "instructor" TEXT,
    "location" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "certificateNumber" TEXT,
    "certificatePath" TEXT,
    "status" "SafetyTrainingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DvrAcknowledgment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "dvrVersion" TEXT NOT NULL,
    "dvrDate" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "signature" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DvrAcknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaryProcedure" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "infractionType" "DisciplinaryInfractionType" NOT NULL,
    "infractionDate" TIMESTAMP(3) NOT NULL,
    "infractionDescription" TEXT NOT NULL,
    "contestationDate" TIMESTAMP(3),
    "contestationText" TEXT,
    "contestationDeliveryMethod" TEXT,
    "contestationDeliveredAt" TIMESTAMP(3),
    "defenseDeadline" TIMESTAMP(3),
    "defenseReceivedAt" TIMESTAMP(3),
    "defenseText" TEXT,
    "defenseRequestedHearing" BOOLEAN NOT NULL DEFAULT false,
    "hearingDate" TIMESTAMP(3),
    "hearingNotes" TEXT,
    "decisionDate" TIMESTAMP(3),
    "sanctionType" "DisciplinarySanctionType",
    "sanctionDetails" TEXT,
    "sanctionDeliveredAt" TIMESTAMP(3),
    "appealedAt" TIMESTAMP(3),
    "appealOutcome" TEXT,
    "status" "DisciplinaryStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplinaryProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaryDocument" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "type" "DisciplinaryDocType" NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisciplinaryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaryCode" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "postedBy" TEXT,
    "postedLocation" TEXT,
    "photoPath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplinaryCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaryCodeAcknowledgment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL DEFAULT 'DIGITAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisciplinaryCodeAcknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhistleblowingReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reporterType" "WhistleblowerType" NOT NULL,
    "reporterName" TEXT,
    "reporterEmail" TEXT,
    "reporterPhone" TEXT,
    "reporterRole" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "WhistleblowingCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "personsInvolved" TEXT,
    "evidence" TEXT,
    "assignedTo" TEXT,
    "status" "WhistleblowingStatus" NOT NULL DEFAULT 'RECEIVED',
    "acknowledgedAt" TIMESTAMP(3),
    "investigationStartedAt" TIMESTAMP(3),
    "investigationCompletedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "outcome" TEXT,
    "actionsTaken" TEXT,
    "lastFeedbackAt" TIMESTAMP(3),
    "accessCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhistleblowingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhistleblowingMessage" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhistleblowingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhistleblowingDocument" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhistleblowingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTimeline" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "phase" "OnboardingPhase" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedTo" TEXT,
    "completedBy" TEXT,
    "documentId" TEXT,
    "notes" TEXT,
    "status" "OnboardingPhaseStatus" NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDataChangeRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "changeType" "DataChangeType" NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    "reason" TEXT,
    "documentPath" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedBy" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "status" "DataChangeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDataChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationOutcome" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "probationStartDate" TIMESTAMP(3) NOT NULL,
    "probationEndDate" TIMESTAMP(3) NOT NULL,
    "evaluationDate" TIMESTAMP(3) NOT NULL,
    "evaluatedBy" TEXT NOT NULL,
    "technicalSkills" INTEGER,
    "adaptability" INTEGER,
    "teamwork" INTEGER,
    "punctuality" INTEGER,
    "initiative" INTEGER,
    "overallScore" DOUBLE PRECISION,
    "strengths" TEXT,
    "areasForImprovement" TEXT,
    "evaluatorNotes" TEXT,
    "outcome" "ProbationResult" NOT NULL,
    "outcomeDate" TIMESTAMP(3),
    "outcomeNotes" TEXT,
    "terminationDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "notificationMethod" TEXT,
    "employeeSignedAt" TIMESTAMP(3),
    "signaturePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProbationOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantClient" (
    "id" TEXT NOT NULL,
    "consultantId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSONB,

    CONSTRAINT "ConsultantClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantInvite" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultantInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeNote" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "NoteCategory" NOT NULL DEFAULT 'GENERAL',
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "grossAmount" DECIMAL(10,2),
    "netAmount" DECIMAL(10,2),
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "viewedIp" TEXT,
    "downloadedAt" TIMESTAMP(3),

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSignatureRequest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "SignaturePriority" NOT NULL DEFAULT 'NORMAL',
    "requirePassword" BOOLEAN NOT NULL DEFAULT true,
    "requireOtp" BOOLEAN NOT NULL DEFAULT true,
    "requirePhrase" BOOLEAN NOT NULL DEFAULT true,
    "minReadingTime" INTEGER NOT NULL DEFAULT 30,
    "signedAt" TIMESTAMP(3),
    "signatureData" JSONB,
    "certificateId" TEXT,
    "certificateUrl" TEXT,

    CONSTRAINT "DocumentSignatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureAuditLog" (
    "id" TEXT NOT NULL,
    "signatureRequestId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "action" "SignatureAction" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "geoLocation" JSONB,
    "passwordVerified" BOOLEAN,
    "otpMethod" TEXT,
    "otpVerified" BOOLEAN,
    "otpAttempts" INTEGER,
    "confirmationPhrase" TEXT,
    "expectedPhrase" TEXT,
    "documentHash" TEXT,
    "scrollPercentage" INTEGER,
    "timeOnDocument" INTEGER,
    "pagesViewed" INTEGER,
    "totalPages" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "SignatureAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "clockInLat" DECIMAL(10,8),
    "clockInLng" DECIMAL(11,8),
    "clockInAddress" TEXT,
    "clockInAccuracy" DOUBLE PRECISION,
    "clockOutLat" DECIMAL(10,8),
    "clockOutLng" DECIMAL(11,8),
    "clockOutAddress" TEXT,
    "clockOutAccuracy" DOUBLE PRECISION,
    "clockInIp" TEXT,
    "clockOutIp" TEXT,
    "clockInDevice" TEXT,
    "clockOutDevice" TEXT,
    "clockInUserAgent" TEXT,
    "clockOutUserAgent" TEXT,
    "workedMinutes" INTEGER,
    "breakMinutes" INTEGER DEFAULT 0,
    "overtimeMinutes" INTEGER DEFAULT 0,
    "status" "TimeEntryStatus" NOT NULL DEFAULT 'PENDING',
    "anomalyType" "TimeAnomalyType",
    "notes" TEXT,
    "managerNotes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkLocation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 100,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "startHalf" BOOLEAN NOT NULL DEFAULT false,
    "endHalf" BOOLEAN NOT NULL DEFAULT false,
    "totalDays" DECIMAL(4,1) NOT NULL,
    "totalHours" DECIMAL(5,1),
    "reason" TEXT,
    "attachmentUrl" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vacationTotal" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vacationUsed" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vacationPending" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vacationCarryOver" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vacationExpireDate" TIMESTAMP(3),
    "rolTotal" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "rolUsed" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "rolPending" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "exFestTotal" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "exFestUsed" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "exFestPending" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sickDaysUsed" INTEGER NOT NULL DEFAULT 0,
    "law104Total" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "law104Used" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastCalculatedAt" TIMESTAMP(3),

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "kilometers" DECIMAL(8,2),
    "ratePerKm" DECIMAL(4,3),
    "origin" TEXT,
    "destination" TEXT,
    "vehicleType" "VehicleType",
    "vehiclePlate" TEXT,
    "tripPurpose" TEXT,
    "clientName" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "paidAt" TIMESTAMP(3),
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseReceipt" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MileageRate" (
    "id" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "year" INTEGER NOT NULL,
    "ratePerKm" DECIMAL(4,3) NOT NULL,
    "source" TEXT,
    "fuelType" TEXT,
    "engineCc" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MileageRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "referenceId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastAttemptAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TotpSecret" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "backupCodes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TotpSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeInvite" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "TenantRole" NOT NULL DEFAULT 'EMPLOYEE',
    "employeeId" TEXT,
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "firstName" TEXT,
    "lastName" TEXT,
    "department" TEXT,
    "jobTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "pushSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorialProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "status" "TutorialStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "currentSection" INTEGER NOT NULL DEFAULT 0,
    "totalSections" INTEGER NOT NULL,
    "completedSections" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorialProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorialAnalytics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "avgTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorialAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_stripeCustomerId_key" ON "Tenant"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMember_userId_tenantId_key" ON "TenantMember"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "Employee_tenantId_idx" ON "Employee"("tenantId");

-- CreateIndex
CREATE INDEX "Employee_userId_idx" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "Document_tenantId_idx" ON "Document"("tenantId");

-- CreateIndex
CREATE INDEX "Document_employeeId_idx" ON "Document"("employeeId");

-- CreateIndex
CREATE INDEX "Deadline_tenantId_idx" ON "Deadline"("tenantId");

-- CreateIndex
CREATE INDEX "Deadline_dueDate_idx" ON "Deadline"("dueDate");

-- CreateIndex
CREATE INDEX "PerformanceReview_tenantId_idx" ON "PerformanceReview"("tenantId");

-- CreateIndex
CREATE INDEX "PerformanceReview_employeeId_idx" ON "PerformanceReview"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_tenantId_idx" ON "OnboardingChecklist"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingItem_employeeId_checklistItemId_key" ON "OnboardingItem"("employeeId", "checklistItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeInvoiceId_key" ON "Invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "LegalDocument_type_isActive_idx" ON "LegalDocument"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument_type_version_key" ON "LegalDocument"("type", "version");

-- CreateIndex
CREATE INDEX "LegalAcceptance_userId_idx" ON "LegalAcceptance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalAcceptance_userId_legalDocumentId_key" ON "LegalAcceptance"("userId", "legalDocumentId");

-- CreateIndex
CREATE INDEX "GdprConsent_tenantId_idx" ON "GdprConsent"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "GdprConsent_employeeId_consentType_key" ON "GdprConsent"("employeeId", "consentType");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CookieConsent_visitorId_key" ON "CookieConsent"("visitorId");

-- CreateIndex
CREATE INDEX "SafetyTraining_tenantId_idx" ON "SafetyTraining"("tenantId");

-- CreateIndex
CREATE INDEX "SafetyTraining_employeeId_idx" ON "SafetyTraining"("employeeId");

-- CreateIndex
CREATE INDEX "SafetyTraining_expiresAt_idx" ON "SafetyTraining"("expiresAt");

-- CreateIndex
CREATE INDEX "DvrAcknowledgment_tenantId_idx" ON "DvrAcknowledgment"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DvrAcknowledgment_employeeId_dvrVersion_key" ON "DvrAcknowledgment"("employeeId", "dvrVersion");

-- CreateIndex
CREATE INDEX "DisciplinaryProcedure_tenantId_idx" ON "DisciplinaryProcedure"("tenantId");

-- CreateIndex
CREATE INDEX "DisciplinaryProcedure_employeeId_idx" ON "DisciplinaryProcedure"("employeeId");

-- CreateIndex
CREATE INDEX "DisciplinaryProcedure_status_idx" ON "DisciplinaryProcedure"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplinaryCode_tenantId_key" ON "DisciplinaryCode"("tenantId");

-- CreateIndex
CREATE INDEX "DisciplinaryCodeAcknowledgment_tenantId_idx" ON "DisciplinaryCodeAcknowledgment"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DisciplinaryCodeAcknowledgment_employeeId_codeId_key" ON "DisciplinaryCodeAcknowledgment"("employeeId", "codeId");

-- CreateIndex
CREATE UNIQUE INDEX "WhistleblowingReport_accessCode_key" ON "WhistleblowingReport"("accessCode");

-- CreateIndex
CREATE INDEX "WhistleblowingReport_tenantId_idx" ON "WhistleblowingReport"("tenantId");

-- CreateIndex
CREATE INDEX "WhistleblowingReport_status_idx" ON "WhistleblowingReport"("status");

-- CreateIndex
CREATE INDEX "WhistleblowingReport_accessCode_idx" ON "WhistleblowingReport"("accessCode");

-- CreateIndex
CREATE INDEX "OnboardingTimeline_tenantId_idx" ON "OnboardingTimeline"("tenantId");

-- CreateIndex
CREATE INDEX "OnboardingTimeline_employeeId_idx" ON "OnboardingTimeline"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingTimeline_status_idx" ON "OnboardingTimeline"("status");

-- CreateIndex
CREATE INDEX "EmployeeDataChangeRequest_tenantId_idx" ON "EmployeeDataChangeRequest"("tenantId");

-- CreateIndex
CREATE INDEX "EmployeeDataChangeRequest_employeeId_idx" ON "EmployeeDataChangeRequest"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeDataChangeRequest_status_idx" ON "EmployeeDataChangeRequest"("status");

-- CreateIndex
CREATE INDEX "ProbationOutcome_tenantId_idx" ON "ProbationOutcome"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProbationOutcome_employeeId_key" ON "ProbationOutcome"("employeeId");

-- CreateIndex
CREATE INDEX "ConsultantClient_consultantId_idx" ON "ConsultantClient"("consultantId");

-- CreateIndex
CREATE INDEX "ConsultantClient_tenantId_idx" ON "ConsultantClient"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultantClient_consultantId_tenantId_key" ON "ConsultantClient"("consultantId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultantInvite_token_key" ON "ConsultantInvite"("token");

-- CreateIndex
CREATE INDEX "ConsultantInvite_tenantId_idx" ON "ConsultantInvite"("tenantId");

-- CreateIndex
CREATE INDEX "ConsultantInvite_email_idx" ON "ConsultantInvite"("email");

-- CreateIndex
CREATE INDEX "ConsultantInvite_token_idx" ON "ConsultantInvite"("token");

-- CreateIndex
CREATE INDEX "EmployeeNote_employeeId_idx" ON "EmployeeNote"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeNote_tenantId_idx" ON "EmployeeNote"("tenantId");

-- CreateIndex
CREATE INDEX "Payslip_tenantId_idx" ON "Payslip"("tenantId");

-- CreateIndex
CREATE INDEX "Payslip_employeeId_idx" ON "Payslip"("employeeId");

-- CreateIndex
CREATE INDEX "Payslip_period_idx" ON "Payslip"("period");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_employeeId_period_key" ON "Payslip"("employeeId", "period");

-- CreateIndex
CREATE INDEX "DocumentSignatureRequest_tenantId_idx" ON "DocumentSignatureRequest"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentSignatureRequest_employeeId_idx" ON "DocumentSignatureRequest"("employeeId");

-- CreateIndex
CREATE INDEX "DocumentSignatureRequest_status_idx" ON "DocumentSignatureRequest"("status");

-- CreateIndex
CREATE INDEX "DocumentSignatureRequest_documentId_idx" ON "DocumentSignatureRequest"("documentId");

-- CreateIndex
CREATE INDEX "SignatureAuditLog_signatureRequestId_idx" ON "SignatureAuditLog"("signatureRequestId");

-- CreateIndex
CREATE INDEX "SignatureAuditLog_tenantId_idx" ON "SignatureAuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "SignatureAuditLog_employeeId_idx" ON "SignatureAuditLog"("employeeId");

-- CreateIndex
CREATE INDEX "SignatureAuditLog_action_idx" ON "SignatureAuditLog"("action");

-- CreateIndex
CREATE INDEX "SignatureAuditLog_timestamp_idx" ON "SignatureAuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "TimeEntry_tenantId_idx" ON "TimeEntry"("tenantId");

-- CreateIndex
CREATE INDEX "TimeEntry_date_idx" ON "TimeEntry"("date");

-- CreateIndex
CREATE INDEX "TimeEntry_status_idx" ON "TimeEntry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TimeEntry_employeeId_date_key" ON "TimeEntry"("employeeId", "date");

-- CreateIndex
CREATE INDEX "WorkLocation_tenantId_idx" ON "WorkLocation"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveRequest_tenantId_idx" ON "LeaveRequest"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");

-- CreateIndex
CREATE INDEX "LeaveRequest_startDate_idx" ON "LeaveRequest"("startDate");

-- CreateIndex
CREATE INDEX "LeaveBalance_tenantId_idx" ON "LeaveBalance"("tenantId");

-- CreateIndex
CREATE INDEX "LeaveBalance_year_idx" ON "LeaveBalance"("year");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_year_key" ON "LeaveBalance"("employeeId", "year");

-- CreateIndex
CREATE INDEX "ExpenseRequest_tenantId_idx" ON "ExpenseRequest"("tenantId");

-- CreateIndex
CREATE INDEX "ExpenseRequest_employeeId_idx" ON "ExpenseRequest"("employeeId");

-- CreateIndex
CREATE INDEX "ExpenseRequest_status_idx" ON "ExpenseRequest"("status");

-- CreateIndex
CREATE INDEX "ExpenseRequest_date_idx" ON "ExpenseRequest"("date");

-- CreateIndex
CREATE INDEX "ExpenseReceipt_expenseId_idx" ON "ExpenseReceipt"("expenseId");

-- CreateIndex
CREATE INDEX "MileageRate_year_idx" ON "MileageRate"("year");

-- CreateIndex
CREATE INDEX "MileageRate_vehicleType_idx" ON "MileageRate"("vehicleType");

-- CreateIndex
CREATE UNIQUE INDEX "MileageRate_vehicleType_year_engineCc_key" ON "MileageRate"("vehicleType", "year", "engineCc");

-- CreateIndex
CREATE INDEX "OtpCode_userId_idx" ON "OtpCode"("userId");

-- CreateIndex
CREATE INDEX "OtpCode_code_idx" ON "OtpCode"("code");

-- CreateIndex
CREATE INDEX "OtpCode_purpose_referenceId_idx" ON "OtpCode"("purpose", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "TotpSecret_userId_key" ON "TotpSecret"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeInvite_token_key" ON "EmployeeInvite"("token");

-- CreateIndex
CREATE INDEX "EmployeeInvite_tenantId_idx" ON "EmployeeInvite"("tenantId");

-- CreateIndex
CREATE INDEX "EmployeeInvite_email_idx" ON "EmployeeInvite"("email");

-- CreateIndex
CREATE INDEX "EmployeeInvite_token_idx" ON "EmployeeInvite"("token");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "TutorialProgress_userId_idx" ON "TutorialProgress"("userId");

-- CreateIndex
CREATE INDEX "TutorialProgress_tenantId_idx" ON "TutorialProgress"("tenantId");

-- CreateIndex
CREATE INDEX "TutorialProgress_tutorialId_idx" ON "TutorialProgress"("tutorialId");

-- CreateIndex
CREATE INDEX "TutorialProgress_status_idx" ON "TutorialProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TutorialProgress_userId_tutorialId_tenantId_key" ON "TutorialProgress"("userId", "tutorialId", "tenantId");

-- CreateIndex
CREATE INDEX "TutorialAnalytics_tenantId_idx" ON "TutorialAnalytics"("tenantId");

-- CreateIndex
CREATE INDEX "TutorialAnalytics_tutorialId_idx" ON "TutorialAnalytics"("tutorialId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorialAnalytics_tenantId_tutorialId_year_month_key" ON "TutorialAnalytics"("tenantId", "tutorialId", "year", "month");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_parentTenantId_fkey" FOREIGN KEY ("parentTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMember" ADD CONSTRAINT "TenantMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMember" ADD CONSTRAINT "TenantMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklistItem" ADD CONSTRAINT "OnboardingChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OnboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingItem" ADD CONSTRAINT "OnboardingItem_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingItem" ADD CONSTRAINT "OnboardingItem_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "OnboardingChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalAcceptance" ADD CONSTRAINT "LegalAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalAcceptance" ADD CONSTRAINT "LegalAcceptance_legalDocumentId_fkey" FOREIGN KEY ("legalDocumentId") REFERENCES "LegalDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GdprConsent" ADD CONSTRAINT "GdprConsent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GdprConsent" ADD CONSTRAINT "GdprConsent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyTraining" ADD CONSTRAINT "SafetyTraining_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyTraining" ADD CONSTRAINT "SafetyTraining_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DvrAcknowledgment" ADD CONSTRAINT "DvrAcknowledgment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DvrAcknowledgment" ADD CONSTRAINT "DvrAcknowledgment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryProcedure" ADD CONSTRAINT "DisciplinaryProcedure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryProcedure" ADD CONSTRAINT "DisciplinaryProcedure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryDocument" ADD CONSTRAINT "DisciplinaryDocument_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "DisciplinaryProcedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryCode" ADD CONSTRAINT "DisciplinaryCode_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryCodeAcknowledgment" ADD CONSTRAINT "DisciplinaryCodeAcknowledgment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryCodeAcknowledgment" ADD CONSTRAINT "DisciplinaryCodeAcknowledgment_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "DisciplinaryCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryCodeAcknowledgment" ADD CONSTRAINT "DisciplinaryCodeAcknowledgment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhistleblowingReport" ADD CONSTRAINT "WhistleblowingReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhistleblowingMessage" ADD CONSTRAINT "WhistleblowingMessage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "WhistleblowingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhistleblowingDocument" ADD CONSTRAINT "WhistleblowingDocument_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "WhistleblowingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTimeline" ADD CONSTRAINT "OnboardingTimeline_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTimeline" ADD CONSTRAINT "OnboardingTimeline_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDataChangeRequest" ADD CONSTRAINT "EmployeeDataChangeRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDataChangeRequest" ADD CONSTRAINT "EmployeeDataChangeRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationOutcome" ADD CONSTRAINT "ProbationOutcome_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationOutcome" ADD CONSTRAINT "ProbationOutcome_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultantClient" ADD CONSTRAINT "ConsultantClient_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultantClient" ADD CONSTRAINT "ConsultantClient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultantInvite" ADD CONSTRAINT "ConsultantInvite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultantInvite" ADD CONSTRAINT "ConsultantInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeNote" ADD CONSTRAINT "EmployeeNote_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeNote" ADD CONSTRAINT "EmployeeNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeNote" ADD CONSTRAINT "EmployeeNote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignatureRequest" ADD CONSTRAINT "DocumentSignatureRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignatureRequest" ADD CONSTRAINT "DocumentSignatureRequest_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignatureRequest" ADD CONSTRAINT "DocumentSignatureRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSignatureRequest" ADD CONSTRAINT "DocumentSignatureRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureAuditLog" ADD CONSTRAINT "SignatureAuditLog_signatureRequestId_fkey" FOREIGN KEY ("signatureRequestId") REFERENCES "DocumentSignatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureAuditLog" ADD CONSTRAINT "SignatureAuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkLocation" ADD CONSTRAINT "WorkLocation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseReceipt" ADD CONSTRAINT "ExpenseReceipt_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "ExpenseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TotpSecret" ADD CONSTRAINT "TotpSecret_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeInvite" ADD CONSTRAINT "EmployeeInvite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeInvite" ADD CONSTRAINT "EmployeeInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeInvite" ADD CONSTRAINT "EmployeeInvite_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialProgress" ADD CONSTRAINT "TutorialProgress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorialAnalytics" ADD CONSTRAINT "TutorialAnalytics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
