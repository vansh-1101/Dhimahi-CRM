-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT', 'PARTNER');

-- CreateEnum
CREATE TYPE "Constitution" AS ENUM ('INDIVIDUAL', 'HUF', 'COMPANY', 'FIRM');

-- CreateEnum
CREATE TYPE "ResidentStatus" AS ENUM ('RESIDENT', 'NRI');

-- CreateEnum
CREATE TYPE "LeadService" AS ENUM ('INSURANCE', 'INVESTMENT', 'LOAN', 'BROKING', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WALKIN', 'WHATSAPP', 'REFERRAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('LIFE', 'MEDICLAIM', 'VEHICLE', 'NON_LIFE');

-- CreateEnum
CREATE TYPE "PremiumFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('ACTIVE', 'LAPSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('SIP', 'LUMPSUM', 'PPF', 'NPS', 'FD');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'REDEEMED');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('HOME', 'PERSONAL', 'CAR', 'BUSINESS', 'EDUCATION');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'CLOSED', 'NPA');

-- CreateEnum
CREATE TYPE "CreditCardStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'MEETING', 'TASK', 'WHATSAPP', 'EMAIL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "mobile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "commissionRate" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "familyName" TEXT,
    "contactPerson" TEXT,
    "mobileNumber" TEXT NOT NULL,
    "panNumber" TEXT,
    "nameAsPerPan" TEXT,
    "aadharNumber" TEXT,
    "dob" TIMESTAMP(3),
    "email" TEXT,
    "motherName" TEXT,
    "placeOfBirth" TEXT,
    "annualIncome" DOUBLE PRECISION,
    "landline" TEXT,
    "constitution" "Constitution" NOT NULL DEFAULT 'INDIVIDUAL',
    "residentStatus" "ResidentStatus" NOT NULL DEFAULT 'RESIDENT',
    "gstNumber" TEXT,
    "referenceName" TEXT,
    "otherDescription" TEXT,
    "hasGst" BOOLEAN NOT NULL DEFAULT false,
    "otherServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mainInsuranceType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "insuranceType" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "associatePartnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "serviceInterested" "LeadService" NOT NULL,
    "source" "LeadSource" NOT NULL DEFAULT 'WALKIN',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "convertedClientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "policyNumber" TEXT,
    "insurerName" TEXT NOT NULL,
    "insuranceType" "InsuranceType" NOT NULL,
    "subType" TEXT,
    "sumAssured" DOUBLE PRECISION,
    "premiumAmount" DOUBLE PRECISION,
    "premiumFrequency" "PremiumFrequency" NOT NULL DEFAULT 'ANNUAL',
    "startDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "nomineeName" TEXT,
    "status" "PolicyStatus" NOT NULL DEFAULT 'ACTIVE',
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "InvestmentType" NOT NULL,
    "fundName" TEXT,
    "folioNumber" TEXT,
    "amount" DOUBLE PRECISION,
    "sipDate" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "currentValue" DOUBLE PRECISION,
    "unitsHeld" DOUBLE PRECISION,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "bankName" TEXT,
    "loanAmount" DOUBLE PRECISION,
    "disbursementDate" TIMESTAMP(3),
    "emiAmount" DOUBLE PRECISION,
    "tenureMonths" INTEGER,
    "interestRate" DOUBLE PRECISION,
    "emiDate" INTEGER,
    "outstandingAmount" DOUBLE PRECISION,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_cards" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "cardType" TEXT,
    "creditLimit" DOUBLE PRECISION,
    "cardNumber_last4" TEXT,
    "expiryDate" TIMESTAMP(3),
    "status" "CreditCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "leadId" TEXT,
    "type" "ActivityType" NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partners_email_key" ON "partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_panNumber_key" ON "clients"("panNumber");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_associatePartnerId_fkey" FOREIGN KEY ("associatePartnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_convertedClientId_fkey" FOREIGN KEY ("convertedClientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
