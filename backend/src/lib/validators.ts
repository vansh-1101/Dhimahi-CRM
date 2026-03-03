import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const clientSchema = z.object({
    contactName: z.string().min(1, 'Contact name is required'),
    familyName: z.string().optional(),
    contactPerson: z.string().optional(),
    mobileNumber: z.string().min(10, 'Valid mobile number required'),
    panNumber: z.string().optional(),
    nameAsPerPan: z.string().optional(),
    aadharNumber: z.string().optional(),
    dob: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    motherName: z.string().optional(),
    placeOfBirth: z.string().optional(),
    annualIncome: z.number().optional(),
    landline: z.string().optional(),
    constitution: z.enum(['INDIVIDUAL', 'HUF', 'COMPANY', 'FIRM']).optional(),
    residentStatus: z.enum(['RESIDENT', 'NRI']).optional(),
    gstNumber: z.string().optional(),
    referenceName: z.string().optional(),
    otherDescription: z.string().optional(),
    hasGst: z.boolean().optional(),
    otherServices: z.array(z.string()).optional(),
    mainInsuranceType: z.array(z.string()).optional(),
    insuranceType: z.array(z.string()).optional(),
    associatePartnerId: z.string().optional(),
});

export const leadSchema = z.object({
    name: z.string().min(1, 'Lead name is required'),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    serviceInterested: z.enum(['INSURANCE', 'INVESTMENT', 'LOAN', 'BROKING', 'CREDIT_CARD']),
    source: z.enum(['WALKIN', 'WHATSAPP', 'REFERRAL', 'ONLINE']).optional(),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
    assignedToId: z.string().optional(),
    followUpDate: z.string().optional(),
    notes: z.string().optional(),
});

export const insuranceSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    policyNumber: z.string().optional(),
    insurerName: z.string().min(1, 'Insurer name is required'),
    insuranceType: z.enum(['LIFE', 'MEDICLAIM', 'VEHICLE', 'NON_LIFE']),
    subType: z.string().optional(),
    sumAssured: z.number().optional(),
    premiumAmount: z.number().optional(),
    premiumFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL']).optional(),
    startDate: z.string().optional(),
    renewalDate: z.string().optional(),
    nomineeName: z.string().optional(),
    status: z.enum(['ACTIVE', 'LAPSED', 'EXPIRED']).optional(),
    documentUrl: z.string().optional(),
});

export const investmentSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    type: z.enum(['SIP', 'LUMPSUM', 'PPF', 'NPS', 'FD']),
    fundName: z.string().optional(),
    folioNumber: z.string().optional(),
    amount: z.number().optional(),
    sipDate: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    currentValue: z.number().optional(),
    unitsHeld: z.number().optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'REDEEMED']).optional(),
});

export const loanSchema = z.object({
    clientId: z.string().min(1, 'Client is required'),
    loanType: z.enum(['HOME', 'PERSONAL', 'CAR', 'BUSINESS', 'EDUCATION']),
    bankName: z.string().optional(),
    loanAmount: z.number().optional(),
    disbursementDate: z.string().optional(),
    emiAmount: z.number().optional(),
    tenureMonths: z.number().optional(),
    interestRate: z.number().optional(),
    emiDate: z.number().optional(),
    outstandingAmount: z.number().optional(),
    status: z.enum(['ACTIVE', 'CLOSED', 'NPA']).optional(),
});

export const activitySchema = z.object({
    clientId: z.string().optional(),
    leadId: z.string().optional(),
    type: z.enum(['CALL', 'MEETING', 'TASK', 'WHATSAPP', 'EMAIL']),
    subject: z.string().min(1, 'Subject is required'),
    notes: z.string().optional(),
    scheduledAt: z.string().optional(),
    completedAt: z.string().optional(),
});

export const leadStatusUpdateSchema = z.object({
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']),
});
