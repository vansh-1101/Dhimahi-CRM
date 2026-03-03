export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'AGENT' | 'PARTNER';
    mobile?: string;
}

export interface Partner {
    id: string;
    name: string;
    mobile?: string;
    email?: string;
    commissionRate?: number;
    _count?: { clients: number };
}

export interface Client {
    id: string;
    contactName: string;
    familyName?: string;
    contactPerson?: string;
    mobileNumber: string;
    panNumber?: string;
    nameAsPerPan?: string;
    aadharNumber?: string;
    dob?: string;
    email?: string;
    motherName?: string;
    placeOfBirth?: string;
    annualIncome?: number;
    landline?: string;
    constitution: 'INDIVIDUAL' | 'HUF' | 'COMPANY' | 'FIRM';
    residentStatus: 'RESIDENT' | 'NRI';
    gstNumber?: string;
    referenceName?: string;
    otherDescription?: string;
    hasGst: boolean;
    otherServices: string[];
    mainInsuranceType: string[];
    insuranceType: string[];
    associatePartnerId?: string;
    associatePartner?: Partner;
    insurancePolicies?: InsurancePolicy[];
    investments?: Investment[];
    loans?: Loan[];
    creditCards?: CreditCard[];
    activities?: Activity[];
    createdAt: string;
    updatedAt: string;
}

export interface Lead {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    serviceInterested: 'INSURANCE' | 'INVESTMENT' | 'LOAN' | 'BROKING' | 'CREDIT_CARD';
    source: 'WALKIN' | 'WHATSAPP' | 'REFERRAL' | 'ONLINE';
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
    assignedToId?: string;
    assignedTo?: { name: string };
    followUpDate?: string;
    notes?: string;
    convertedClientId?: string;
    convertedClient?: { contactName: string };
    createdAt: string;
}

export interface InsurancePolicy {
    id: string;
    clientId: string;
    client?: { contactName: string; mobileNumber: string; email?: string };
    policyNumber?: string;
    insurerName: string;
    insuranceType: 'LIFE' | 'MEDICLAIM' | 'VEHICLE' | 'NON_LIFE';
    subType?: string;
    sumAssured?: number;
    premiumAmount?: number;
    premiumFrequency: 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';
    startDate?: string;
    renewalDate?: string;
    nomineeName?: string;
    status: 'ACTIVE' | 'LAPSED' | 'EXPIRED';
    documentUrl?: string;
}

export interface Investment {
    id: string;
    clientId: string;
    client?: { contactName: string; mobileNumber: string };
    type: 'SIP' | 'LUMPSUM' | 'PPF' | 'NPS' | 'FD';
    fundName?: string;
    folioNumber?: string;
    amount?: number;
    sipDate?: number;
    startDate?: string;
    endDate?: string;
    currentValue?: number;
    unitsHeld?: number;
    status: 'ACTIVE' | 'PAUSED' | 'REDEEMED';
}

export interface Loan {
    id: string;
    clientId: string;
    client?: { contactName: string; mobileNumber: string };
    loanType: 'HOME' | 'PERSONAL' | 'CAR' | 'BUSINESS' | 'EDUCATION';
    bankName?: string;
    loanAmount?: number;
    disbursementDate?: string;
    emiAmount?: number;
    tenureMonths?: number;
    interestRate?: number;
    emiDate?: number;
    outstandingAmount?: number;
    status: 'ACTIVE' | 'CLOSED' | 'NPA';
}

export interface CreditCard {
    id: string;
    clientId: string;
    bankName: string;
    cardType?: string;
    creditLimit?: number;
    cardNumber_last4?: string;
    expiryDate?: string;
    status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'CANCELLED';
}

export interface Activity {
    id: string;
    clientId?: string;
    client?: { contactName: string };
    leadId?: string;
    lead?: { name: string };
    type: 'CALL' | 'MEETING' | 'TASK' | 'WHATSAPP' | 'EMAIL';
    subject: string;
    notes?: string;
    scheduledAt?: string;
    completedAt?: string;
    createdById?: string;
    createdBy?: { name: string };
    createdAt: string;
}

export interface DashboardStats {
    stats: {
        totalClients: number;
        activeLeads: number;
        renewingPolicies: number;
        activeSIPs: number;
    };
    recentActivities: Activity[];
    clientsByMonth: { month: string; count: number }[];
    serviceDistribution: { service: string; count: number }[];
}
