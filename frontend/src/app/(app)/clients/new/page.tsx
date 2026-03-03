'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/header';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Partner } from '@/lib/types';

interface ClientForm {
    contactName: string;
    familyName: string;
    contactPerson: string;
    mobileNumber: string;
    panNumber: string;
    nameAsPerPan: string;
    aadharNumber: string;
    dob: string;
    email: string;
    motherName: string;
    placeOfBirth: string;
    annualIncome: string;
    landline: string;
    constitution: string;
    residentStatus: string;
    referenceName: string;
    gstNumber: string;
    otherDescription: string;
    hasGst: boolean;
    associatePartnerId: string;
    otherServices: string[];
    mainInsuranceType: string[];
    insuranceType: string[];
}

const defaultForm: ClientForm = {
    contactName: '', familyName: '', contactPerson: '', mobileNumber: '',
    panNumber: '', nameAsPerPan: '', aadharNumber: '', dob: '', email: '',
    motherName: '', placeOfBirth: '', annualIncome: '', landline: '',
    constitution: 'INDIVIDUAL', residentStatus: 'RESIDENT', referenceName: '',
    gstNumber: '', otherDescription: '', hasGst: false, associatePartnerId: '',
    otherServices: [], mainInsuranceType: [], insuranceType: [],
};

export default function ClientFormPage() {
    const router = useRouter();
    const params = useParams();
    const isEdit = params?.id && params.id !== 'new';
    const [form, setForm] = useState<ClientForm>(defaultForm);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        api.getPartners().then(setPartners).catch(() => { });
        if (isEdit) {
            api.getClient(params.id as string).then((client: any) => {
                setForm({
                    contactName: client.contactName || '',
                    familyName: client.familyName || '',
                    contactPerson: client.contactPerson || '',
                    mobileNumber: client.mobileNumber || '',
                    panNumber: client.panNumber || '',
                    nameAsPerPan: client.nameAsPerPan || '',
                    aadharNumber: client.aadharNumber || '',
                    dob: client.dob ? new Date(client.dob).toISOString().split('T')[0] : '',
                    email: client.email || '',
                    motherName: client.motherName || '',
                    placeOfBirth: client.placeOfBirth || '',
                    annualIncome: client.annualIncome?.toString() || '',
                    landline: client.landline || '',
                    constitution: client.constitution || 'INDIVIDUAL',
                    residentStatus: client.residentStatus || 'RESIDENT',
                    referenceName: client.referenceName || '',
                    gstNumber: client.gstNumber || '',
                    otherDescription: client.otherDescription || '',
                    hasGst: client.hasGst || false,
                    associatePartnerId: client.associatePartnerId || '',
                    otherServices: client.otherServices || [],
                    mainInsuranceType: client.mainInsuranceType || [],
                    insuranceType: client.insuranceType || [],
                });
            }).catch(() => toast.error('Failed to load client'));
        }
    }, []);

    const handleChange = (field: keyof ClientForm, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const toggleArrayItem = (field: 'otherServices' | 'mainInsuranceType' | 'insuranceType', item: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item],
        }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.contactName.trim()) errs.contactName = 'Contact name is required';
        if (!form.mobileNumber.trim()) errs.mobileNumber = 'Mobile number is required';
        if (form.mobileNumber && form.mobileNumber.length < 10) errs.mobileNumber = 'Enter a valid mobile number';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                ...form,
                annualIncome: form.annualIncome ? parseFloat(form.annualIncome) : undefined,
                associatePartnerId: form.associatePartnerId || undefined,
            };
            if (isEdit) {
                await api.updateClient(params.id as string, payload);
                toast.success('Client updated!');
            } else {
                await api.createClient(payload);
                toast.success('Client created!');
            }
            router.push('/clients');
        } catch (err: any) {
            toast.error(err.message || 'Failed to save client');
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
        <div>
            <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );

    return (
        <>
            <Header title={isEdit ? 'Edit Client' : 'Add New Client'} />
            <div className="p-6 animate-fade-in">
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
                    {/* Personal Information */}
                    <div className="card p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-purple-600 rounded-full" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Field label="Contact (Recipient) Name" required error={errors.contactName}>
                                <input className="input-field" value={form.contactName} onChange={e => handleChange('contactName', e.target.value)} />
                            </Field>
                            <Field label="Family Name">
                                <input className="input-field" value={form.familyName} onChange={e => handleChange('familyName', e.target.value)} />
                            </Field>
                            <Field label="Contact Person">
                                <input className="input-field" value={form.contactPerson} onChange={e => handleChange('contactPerson', e.target.value)} />
                            </Field>
                            <Field label="Mobile Number" required error={errors.mobileNumber}>
                                <input className="input-field" value={form.mobileNumber} onChange={e => handleChange('mobileNumber', e.target.value)} />
                            </Field>
                            <Field label="PAN Number">
                                <input className="input-field font-mono uppercase" value={form.panNumber} onChange={e => handleChange('panNumber', e.target.value.toUpperCase())} maxLength={10} />
                            </Field>
                            <Field label="Name as per PAN">
                                <input className="input-field" value={form.nameAsPerPan} onChange={e => handleChange('nameAsPerPan', e.target.value)} />
                            </Field>
                            <Field label="Aadhar Number">
                                <input className="input-field" value={form.aadharNumber} onChange={e => handleChange('aadharNumber', e.target.value)} />
                            </Field>
                            <Field label="Date of Birth">
                                <input type="date" className="input-field" value={form.dob} onChange={e => handleChange('dob', e.target.value)} />
                            </Field>
                            <Field label="Email" error={errors.email}>
                                <input type="email" className="input-field" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                            </Field>
                            <Field label="Mother's Name">
                                <input className="input-field" value={form.motherName} onChange={e => handleChange('motherName', e.target.value)} />
                            </Field>
                            <Field label="Place of Birth">
                                <input className="input-field" value={form.placeOfBirth} onChange={e => handleChange('placeOfBirth', e.target.value)} />
                            </Field>
                            <Field label="Approx Annual Income">
                                <input type="number" className="input-field" value={form.annualIncome} onChange={e => handleChange('annualIncome', e.target.value)} />
                            </Field>
                            <Field label="Landline">
                                <input className="input-field" value={form.landline} onChange={e => handleChange('landline', e.target.value)} />
                            </Field>
                            <Field label="Constitution Name">
                                <select className="select-field" value={form.constitution} onChange={e => handleChange('constitution', e.target.value)}>
                                    <option value="INDIVIDUAL">Individual</option>
                                    <option value="HUF">HUF</option>
                                    <option value="COMPANY">Company</option>
                                    <option value="FIRM">Firm</option>
                                </select>
                            </Field>
                            <Field label="Resident Status">
                                <select className="select-field" value={form.residentStatus} onChange={e => handleChange('residentStatus', e.target.value)}>
                                    <option value="RESIDENT">Resident</option>
                                    <option value="NRI">NRI</option>
                                </select>
                            </Field>
                            <Field label="Reference Name">
                                <input className="input-field" value={form.referenceName} onChange={e => handleChange('referenceName', e.target.value)} />
                            </Field>
                            <Field label="GST Number">
                                <input className="input-field font-mono uppercase" value={form.gstNumber} onChange={e => handleChange('gstNumber', e.target.value.toUpperCase())} />
                            </Field>
                            <Field label="Associate Partner">
                                <select className="select-field" value={form.associatePartnerId} onChange={e => handleChange('associatePartnerId', e.target.value)}>
                                    <option value="">-- Select Partner --</option>
                                    {partners.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Other Description">
                                <input className="input-field" value={form.otherDescription} onChange={e => handleChange('otherDescription', e.target.value)} />
                            </Field>
                        </div>
                    </div>

                    {/* Taxation */}
                    <div className="card p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-purple-600 rounded-full" />
                            Taxation
                        </h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.hasGst} onChange={e => handleChange('hasGst', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">GST Applicable</span>
                        </label>
                    </div>

                    {/* Other Services */}
                    <div className="card p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-purple-600 rounded-full" />
                            Other Services
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {['Insurance', 'Loan', 'Investment', 'Stock Broking', 'Credit Card'].map(service => {
                                const val = service.toUpperCase().replace(' ', '_');
                                return (
                                    <label key={service} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                                        <input type="checkbox" checked={form.otherServices.includes(val)} onChange={() => toggleArrayItem('otherServices', val)}
                                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">{service}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Insurance Types */}
                    <div className="card p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-purple-600 rounded-full" />
                            Main Insurance Type
                        </h3>
                        <div className="flex flex-wrap gap-3 mb-6">
                            {['Life Insurance', 'MainTypeIns', 'Non Life Insurance'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                                    <input type="checkbox" checked={form.mainInsuranceType.includes(type)} onChange={() => toggleArrayItem('mainInsuranceType', type)}
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                            Insurance Type
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {['Mediclaim', 'Personal Vehicle', 'Commercial Vehicle', 'Stock Insurance'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                                    <input type="checkbox" checked={form.insuranceType.includes(type)} onChange={() => toggleArrayItem('insuranceType', type)}
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                        <button type="button" onClick={() => router.back()} className="btn-secondary text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                            {saving ? 'Saving...' : isEdit ? 'Update Client' : 'Create Client'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
