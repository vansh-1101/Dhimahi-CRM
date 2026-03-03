import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@dhimahi.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@dhimahi.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            mobile: '9876543210',
        },
    });

    // Create agent user
    const agentPassword = await bcrypt.hash('agent123', 10);
    const agent = await prisma.user.upsert({
        where: { email: 'agent@dhimahi.com' },
        update: {},
        create: {
            name: 'Rahul Sharma',
            email: 'agent@dhimahi.com',
            passwordHash: agentPassword,
            role: 'AGENT',
            mobile: '9876543211',
        },
    });

    // Create partners
    const partner1 = await prisma.partner.upsert({
        where: { email: 'partner1@dhimahi.com' },
        update: {},
        create: {
            name: 'Vijay Associates',
            mobile: '9876543212',
            email: 'partner1@dhimahi.com',
            commissionRate: 5.0,
        },
    });

    const partner2 = await prisma.partner.upsert({
        where: { email: 'partner2@dhimahi.com' },
        update: {},
        create: {
            name: 'Priya Financial Services',
            mobile: '9876543213',
            email: 'partner2@dhimahi.com',
            commissionRate: 4.5,
        },
    });

    // Create clients
    const clients = await Promise.all([
        prisma.client.create({
            data: {
                contactName: 'Amit Patel',
                familyName: 'Patel',
                contactPerson: 'Amit Patel',
                mobileNumber: '9898123456',
                panNumber: 'ABCDE1234F',
                nameAsPerPan: 'AMIT KUMAR PATEL',
                aadharNumber: '1234 5678 9012',
                dob: new Date('1985-06-15'),
                email: 'amit.patel@email.com',
                motherName: 'Sunita Patel',
                placeOfBirth: 'Ahmedabad',
                annualIncome: 1200000,
                constitution: 'INDIVIDUAL',
                residentStatus: 'RESIDENT',
                otherServices: ['INSURANCE', 'INVESTMENT', 'LOAN'],
                mainInsuranceType: ['Life Insurance'],
                insuranceType: ['Mediclaim'],
                associatePartnerId: partner1.id,
            },
        }),
        prisma.client.create({
            data: {
                contactName: 'Neha Shah',
                familyName: 'Shah',
                contactPerson: 'Neha Shah',
                mobileNumber: '9898654321',
                panNumber: 'FGHIJ5678K',
                nameAsPerPan: 'NEHA SHAH',
                dob: new Date('1990-03-22'),
                email: 'neha.shah@email.com',
                motherName: 'Kavita Shah',
                placeOfBirth: 'Mumbai',
                annualIncome: 800000,
                constitution: 'INDIVIDUAL',
                residentStatus: 'RESIDENT',
                otherServices: ['INSURANCE', 'CREDIT_CARD'],
                mainInsuranceType: ['Life Insurance', 'Non Life Insurance'],
                insuranceType: ['Mediclaim', 'Personal Vehicle'],
                associatePartnerId: partner2.id,
            },
        }),
        prisma.client.create({
            data: {
                contactName: 'Rajesh Industries',
                familyName: 'Rajesh',
                contactPerson: 'Rajesh Mehta',
                mobileNumber: '9898111222',
                panNumber: 'KLMNO9012P',
                nameAsPerPan: 'RAJESH INDUSTRIES',
                email: 'rajesh@rajesh-ind.com',
                annualIncome: 5000000,
                constitution: 'COMPANY',
                residentStatus: 'RESIDENT',
                hasGst: true,
                gstNumber: '24ABCDE1234F1Z5',
                otherServices: ['INSURANCE', 'LOAN', 'INVESTMENT'],
            },
        }),
        prisma.client.create({
            data: {
                contactName: 'Priya Joshi',
                familyName: 'Joshi',
                contactPerson: 'Priya Joshi',
                mobileNumber: '9898333444',
                panNumber: 'QRSTU3456V',
                nameAsPerPan: 'PRIYA JOSHI',
                dob: new Date('1988-11-08'),
                email: 'priya.joshi@email.com',
                annualIncome: 600000,
                constitution: 'INDIVIDUAL',
                residentStatus: 'RESIDENT',
                otherServices: ['INVESTMENT', 'BROKING'],
            },
        }),
        prisma.client.create({
            data: {
                contactName: 'Suresh Kumar',
                familyName: 'Kumar',
                contactPerson: 'Suresh Kumar',
                mobileNumber: '9898555666',
                panNumber: 'WXYZA7890B',
                nameAsPerPan: 'SURESH KUMAR',
                dob: new Date('1975-01-30'),
                email: 'suresh.k@email.com',
                annualIncome: 1500000,
                constitution: 'INDIVIDUAL',
                residentStatus: 'NRI',
                otherServices: ['INSURANCE', 'INVESTMENT', 'LOAN', 'CREDIT_CARD'],
                associatePartnerId: partner1.id,
            },
        }),
    ]);

    // Create insurance policies
    const today = new Date();
    await Promise.all([
        prisma.insurancePolicy.create({
            data: {
                clientId: clients[0].id,
                policyNumber: 'LI-2024-001',
                insurerName: 'LIC of India',
                insuranceType: 'LIFE',
                subType: 'Endowment',
                sumAssured: 2500000,
                premiumAmount: 25000,
                premiumFrequency: 'ANNUAL',
                startDate: new Date('2024-01-15'),
                renewalDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
                nomineeName: 'Sunita Patel',
                status: 'ACTIVE',
            },
        }),
        prisma.insurancePolicy.create({
            data: {
                clientId: clients[0].id,
                policyNumber: 'MC-2024-001',
                insurerName: 'Star Health',
                insuranceType: 'MEDICLAIM',
                sumAssured: 500000,
                premiumAmount: 12000,
                premiumFrequency: 'ANNUAL',
                startDate: new Date('2024-03-01'),
                renewalDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
                nomineeName: 'Sunita Patel',
                status: 'ACTIVE',
            },
        }),
        prisma.insurancePolicy.create({
            data: {
                clientId: clients[1].id,
                policyNumber: 'LI-2024-002',
                insurerName: 'HDFC Life',
                insuranceType: 'LIFE',
                subType: 'Term Plan',
                sumAssured: 5000000,
                premiumAmount: 15000,
                premiumFrequency: 'ANNUAL',
                startDate: new Date('2024-06-01'),
                renewalDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 25),
                nomineeName: 'Kavita Shah',
                status: 'ACTIVE',
            },
        }),
        prisma.insurancePolicy.create({
            data: {
                clientId: clients[4].id,
                policyNumber: 'VH-2024-001',
                insurerName: 'ICICI Lombard',
                insuranceType: 'VEHICLE',
                subType: 'Motor Comprehensive',
                sumAssured: 800000,
                premiumAmount: 8500,
                premiumFrequency: 'ANNUAL',
                startDate: new Date('2024-09-01'),
                renewalDate: new Date(today.getFullYear(), today.getMonth() + 2, 1),
                status: 'ACTIVE',
            },
        }),
    ]);

    // Create investments
    await Promise.all([
        prisma.investment.create({
            data: {
                clientId: clients[0].id,
                type: 'SIP',
                fundName: 'HDFC Mid-Cap Opportunities',
                folioNumber: 'FOL-001',
                amount: 5000,
                sipDate: 5,
                startDate: new Date('2023-01-05'),
                currentValue: 85000,
                unitsHeld: 450.5,
                status: 'ACTIVE',
            },
        }),
        prisma.investment.create({
            data: {
                clientId: clients[0].id,
                type: 'SIP',
                fundName: 'Axis Bluechip Fund',
                folioNumber: 'FOL-002',
                amount: 10000,
                sipDate: 15,
                startDate: new Date('2023-06-15'),
                currentValue: 125000,
                unitsHeld: 3200.75,
                status: 'ACTIVE',
            },
        }),
        prisma.investment.create({
            data: {
                clientId: clients[3].id,
                type: 'LUMPSUM',
                fundName: 'SBI Equity Hybrid',
                folioNumber: 'FOL-003',
                amount: 200000,
                startDate: new Date('2024-01-10'),
                currentValue: 225000,
                unitsHeld: 5600.3,
                status: 'ACTIVE',
            },
        }),
        prisma.investment.create({
            data: {
                clientId: clients[4].id,
                type: 'PPF',
                amount: 150000,
                startDate: new Date('2020-04-01'),
                endDate: new Date('2035-04-01'),
                currentValue: 650000,
                status: 'ACTIVE',
            },
        }),
        prisma.investment.create({
            data: {
                clientId: clients[3].id,
                type: 'SIP',
                fundName: 'Mirae Asset Large Cap',
                folioNumber: 'FOL-004',
                amount: 3000,
                sipDate: 10,
                startDate: new Date('2024-03-10'),
                currentValue: 28000,
                unitsHeld: 890.2,
                status: 'ACTIVE',
            },
        }),
    ]);

    // Create loans
    await Promise.all([
        prisma.loan.create({
            data: {
                clientId: clients[2].id,
                loanType: 'BUSINESS',
                bankName: 'HDFC Bank',
                loanAmount: 5000000,
                disbursementDate: new Date('2023-06-01'),
                emiAmount: 55000,
                tenureMonths: 120,
                interestRate: 10.5,
                emiDate: 5,
                outstandingAmount: 4200000,
                status: 'ACTIVE',
            },
        }),
        prisma.loan.create({
            data: {
                clientId: clients[4].id,
                loanType: 'HOME',
                bankName: 'SBI',
                loanAmount: 3500000,
                disbursementDate: new Date('2022-01-01'),
                emiAmount: 32000,
                tenureMonths: 240,
                interestRate: 8.5,
                emiDate: 10,
                outstandingAmount: 3100000,
                status: 'ACTIVE',
            },
        }),
    ]);

    // Create leads
    await Promise.all([
        prisma.lead.create({
            data: {
                name: 'Karan Desai',
                phone: '9898777888',
                email: 'karan.d@email.com',
                serviceInterested: 'INSURANCE',
                source: 'WALKIN',
                status: 'NEW',
                assignedToId: agent.id,
                notes: 'Interested in term life insurance',
            },
        }),
        prisma.lead.create({
            data: {
                name: 'Meera Gupta',
                phone: '9898999000',
                email: 'meera.g@email.com',
                serviceInterested: 'INVESTMENT',
                source: 'REFERRAL',
                status: 'CONTACTED',
                assignedToId: agent.id,
                followUpDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
                notes: 'Wants to start SIP, referred by Amit Patel',
            },
        }),
        prisma.lead.create({
            data: {
                name: 'Rohit Verma',
                phone: '9898222333',
                serviceInterested: 'LOAN',
                source: 'ONLINE',
                status: 'QUALIFIED',
                assignedToId: admin.id,
                notes: 'Looking for home loan, salary 80k/month',
            },
        }),
        prisma.lead.create({
            data: {
                name: 'Anita Sharma',
                phone: '9898444555',
                email: 'anita.s@email.com',
                serviceInterested: 'CREDIT_CARD',
                source: 'WHATSAPP',
                status: 'NEW',
                notes: 'Inquired about premium credit cards',
            },
        }),
    ]);

    // Create activities
    await Promise.all([
        prisma.activity.create({
            data: {
                clientId: clients[0].id,
                type: 'CALL',
                subject: 'Policy renewal reminder',
                notes: 'Called regarding upcoming LIC policy renewal',
                scheduledAt: new Date(),
                createdById: agent.id,
            },
        }),
        prisma.activity.create({
            data: {
                clientId: clients[1].id,
                type: 'MEETING',
                subject: 'Investment review meeting',
                notes: 'Quarterly portfolio review',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                createdById: admin.id,
            },
        }),
        prisma.activity.create({
            data: {
                clientId: clients[2].id,
                type: 'EMAIL',
                subject: 'Loan statement sent',
                notes: 'Sent annual loan statement via email',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
                completedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
                createdById: agent.id,
            },
        }),
        prisma.activity.create({
            data: {
                type: 'TASK',
                subject: 'Follow up with new leads',
                notes: 'Contact all new leads from this week',
                scheduledAt: new Date(),
                createdById: admin.id,
            },
        }),
    ]);

    // Create credit cards
    await Promise.all([
        prisma.creditCard.create({
            data: {
                clientId: clients[4].id,
                bankName: 'HDFC Bank',
                cardType: 'Regalia',
                creditLimit: 500000,
                cardNumber_last4: '4523',
                expiryDate: new Date('2027-06-01'),
                status: 'ACTIVE',
            },
        }),
        prisma.creditCard.create({
            data: {
                clientId: clients[1].id,
                bankName: 'ICICI Bank',
                cardType: 'Amazon Pay',
                creditLimit: 200000,
                cardNumber_last4: '7891',
                expiryDate: new Date('2026-12-01'),
                status: 'ACTIVE',
            },
        }),
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('📧 Admin login: admin@dhimahi.com / admin123');
    console.log('📧 Agent login: agent@dhimahi.com / agent123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
