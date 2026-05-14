import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, addToast } from '@heroui/react';
import { Icon } from '@iconify/react';
import { nomineeSchema } from '../../schemas/userSchemas';
import MultiEntryFormWrapper from '../ui/MultiEntryFormWrapper';
import { nomineeService } from '../../services';
import { useAuth } from '../../context/AuthContext';

/* ------------------------------ Main Component ------------------------------ */

const NomineeForm = ({ onSkip, onBack, loading }) => {
    const { user } = useAuth();
    const [nominees, setNominees] = useState([]);
    const [saving, setSaving] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    // Fetch nominees on mount
    useEffect(() => {
        const fetchNominees = async () => {
            if (!user?.id) return;

            setFetchLoading(true);
            try {
                const response = await nomineeService.getMyNominee();
                if (response?.data?.success) {
                    setNominees(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching nominees:', error);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchNominees();
    }, [user]);

    // Calculate total share percentage
    const totalSharePercentage = nominees.reduce((sum, nominee) => sum + (Number(nominee.sharePercentage) || 0), 0);

    const handleSave = async (data, editingIndex) => {
        if (!user?.id) return;

        // Validate total share percentage
        const newTotal = editingIndex !== null
            ? nominees.reduce((sum, nominee, idx) =>
                idx === editingIndex ? sum + Number(data.sharePercentage) : sum + Number(nominee.sharePercentage), 0)
            : totalSharePercentage + Number(data.sharePercentage);

        if (newTotal > 100) {
            addToast({
                title: 'Error',
                description: 'Total share percentage cannot exceed 100%',
                color: 'danger',
            });
            return;
        }

        setSaving(true);
        try {
            const nomineeData = { ...data, userId: user.id, sharePercentage: Number(data.sharePercentage) };

            if (editingIndex !== null) {
                // Update existing nominee
                const nomineeId = nominees[editingIndex].id;
                const response = await nomineeService.updateNominee(nomineeId, nomineeData);
                if (response?.data?.success) {
                    const updated = [...nominees];
                    updated[editingIndex] = response.data.data;
                    setNominees(updated);
                }
            } else {
                // Create new nominee
                const response = await nomineeService.createNominee(nomineeData);
                if (response?.data?.success) {
                    setNominees([...nominees, response.data.data]);
                }
            }
        } catch (error) {
            console.error('Error saving nominee:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (nomineeId, index) => {
        if (!nomineeId) {
            setNominees(nominees.filter((_, i) => i !== index));
            return;
        }

        setSaving(true);
        try {
            const response = await nomineeService.deleteNominee(nomineeId);
            if (response?.data?.success) {
                setNominees(nominees.filter((_, i) => i !== index));
            }
        } catch (error) {
            console.error('Error deleting nominee:', error);
        } finally {
            setSaving(false);
        }
    };

    const renderForm = ({ initialData, onSubmit, onCancel }) => {
        return (
            <div className="space-y-4">
                {nominees.length > 0 && (
                    <div className="p-3 rounded-lg bg-default-50 border border-default-200">
                        <p className="text-sm">
                            <span className="font-semibold">Total Share: {totalSharePercentage}%</span>
                            <span className="text-default-500 ml-2">| Remaining: {100 - totalSharePercentage}%</span>
                        </p>
                    </div>
                )}
                <NomineeInputForm initialData={initialData} onSubmit={onSubmit} onCancel={onCancel} loading={saving} />
            </div>
        );
    };

    const renderEntry = ({ entry, index }) => {
        return (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{entry.name}</h4>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                        {entry.sharePercentage}% Share
                    </span>
                </div>
                <div className="text-sm text-default-500 space-y-1">
                    <p>Relationship: {entry.relation}</p>
                    <p>DOB: {entry.dob}</p>
                    <p>Phone: {entry.phoneNumber}</p>
                    <p className="truncate">Address: {entry.address}</p>
                </div>
            </div>
        );
    };

    return (
        <MultiEntryFormWrapper
            entries={nominees}
            onSave={handleSave}
            onDelete={handleDelete}
            onSkip={onSkip}
            renderForm={renderForm}
            renderEntry={renderEntry}
            addButtonText="Add"
            emptyMessage="No nominees added yet. Add your nominees here."
            loading={loading || saving}
        />
    );
};

// Separate component for the actual form inputs
const NomineeInputForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(nomineeSchema),
        defaultValues: initialData || {
            name: '',
            relation: '',
            dob: '',
            phoneNumber: '',
            address: '',
            sharePercentage: 100,
            state: '',
            city: '',
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const onFormSubmit = (data) => {
        // Ensure sharePercentage is a number
        if (data.sharePercentage) data.sharePercentage = Number(data.sharePercentage);
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Nominee Name"
                            placeholder="Enter name"
                            errorMessage={errors.name?.message}
                            isInvalid={!!errors.name}
                            variant="bordered"
                        />
                    )}
                />

                {/* Relationship */}
                <Controller
                    name="relation"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Relationship"
                            placeholder="e.g. Spouse, Child"
                            errorMessage={errors.relation?.message}
                            isInvalid={!!errors.relation}
                            variant="bordered"
                        />
                    )}
                />

                {/* Date of Birth */}
                <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="date"
                            label="Date of Birth"
                            placeholder="Select date"
                            errorMessage={errors.dob?.message}
                            isInvalid={!!errors.dob}
                            variant="bordered"
                        />
                    )}
                />

                {/* Phone Number */}
                <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Phone Number"
                            placeholder="Enter phone number"
                            errorMessage={errors.phoneNumber?.message}
                            isInvalid={!!errors.phoneNumber}
                            variant="bordered"
                        />
                    )}
                />

                {/* Share Percentage */}
                <Input
                    {...register('sharePercentage', { valueAsNumber: true })}
                    type="number"
                    label="Share Percentage (%)"
                    placeholder="Enter percentage"
                    errorMessage={errors.sharePercentage?.message}
                    isInvalid={!!errors.sharePercentage}
                    variant="bordered"
                    min={1}
                    max={100}
                />

                {/* Address */}
                <div className="md:col-span-2">
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label="Address"
                                placeholder="Enter full address"
                                errorMessage={errors.address?.message}
                                isInvalid={!!errors.address}
                                variant="bordered"
                            />
                        )}
                    />
                </div>
                {/* Add State and city */}
                <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="State"
                            placeholder="Enter state"
                            errorMessage={errors.state?.message}
                            isInvalid={!!errors.state}
                            variant="bordered"
                        />
                    )}
                />
                <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="City"
                            placeholder="Enter city"
                            errorMessage={errors.city?.message}
                            isInvalid={!!errors.city}
                            variant="bordered"
                        />
                    )}
                />
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button
                    variant="flat"
                    size="sm"
                    onClick={onCancel}
                    isDisabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    size="sm"
                    type="submit"
                    isLoading={loading}
                >
                    Save Nominee
                </Button>
            </div>
        </form>
    );
};

export default NomineeForm;
