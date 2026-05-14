import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Select, SelectItem, Button, Checkbox } from '@heroui/react';
import { Icon } from '@iconify/react';
import { familyMemberSchema } from '../../schemas/userSchemas';
import MultiEntryFormWrapper from '../ui/MultiEntryFormWrapper';
import { familyMemberService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const FamilyMemberForm = ({ onSkip, onBack, loading }) => {
    const { user } = useAuth();
    const [familyMembers, setFamilyMembers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    // Fetch family members on mount
    useEffect(() => {
        const fetchFamilyMembers = async () => {
            if (!user?.id) return;

            setFetchLoading(true);
            try {
                const response = await familyMemberService.getMyFamilyMembers();
                if (response?.data?.success) {
                    setFamilyMembers(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching family members:', error);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchFamilyMembers();
    }, [user]);

    const handleSave = async (data, editingIndex) => {
        if (!user?.id) return;

        setSaving(true);
        try {
            const memberData = { ...data, userId: user.id };

            if (editingIndex !== null) {
                // Update existing family member
                const memberId = familyMembers[editingIndex].id;
                const response = await familyMemberService.updateFamilyMember(memberId, memberData);
                if (response?.data?.success) {
                    const updated = [...familyMembers];
                    updated[editingIndex] = response.data.data;
                    setFamilyMembers(updated);
                }
            } else {
                // Create new family member
                const response = await familyMemberService.createFamilyMember(memberData);
                if (response?.data?.success) {
                    setFamilyMembers([...familyMembers, response.data.data]);
                }
            }
        } catch (error) {
            console.error('Error saving family member:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (memberId, index) => {
        if (!memberId) {
            setFamilyMembers(familyMembers.filter((_, i) => i !== index));
            return;
        }

        setSaving(true);
        try {
            const response = await familyMemberService.deleteFamilyMember(memberId);
            if (response?.data?.success) {
                setFamilyMembers(familyMembers.filter((_, i) => i !== index));
            }
        } catch (error) {
            console.error('Error deleting family member:', error);
        } finally {
            setSaving(false);
        }
    };

    const renderForm = ({ initialData, onSubmit, onCancel }) => {
        return <FamilyMemberInputForm initialData={initialData} onSubmit={onSubmit} onCancel={onCancel} loading={saving} />;
    };

    const renderEntry = ({ entry, index }) => {
        return (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{entry.name}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-default-100 text-default-600">
                        {entry.relation}
                    </span>
                    {entry.isDependent && (
                        <span className="text-xs px-2 py-1 rounded bg-warning/10 text-warning">
                            Dependent
                        </span>
                    )}
                </div>
                <div className="text-sm text-default-500 space-y-1">
                    <p>DOB: {entry.dob}</p>
                    {entry.phoneNumber && <p>Phone: {entry.phoneNumber}</p>}
                    {entry.occupation && <p>Occupation: {entry.occupation}</p>}
                </div>
            </div>
        );
    };

    return (
        <MultiEntryFormWrapper
            entries={familyMembers}
            onSave={handleSave}
            onDelete={handleDelete}
            onSkip={onSkip}
            renderForm={renderForm}
            renderEntry={renderEntry}
            addButtonText="Add"
            emptyMessage="No family members added yet. Add your family members here."
            loading={loading || saving}
        />
    );
};

// Separate component for the actual form inputs
const FamilyMemberInputForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(familyMemberSchema),
        defaultValues: initialData || {
            name: '',
            relation: '',
            dob: '',
            phoneNumber: '',
            occupation: '',
            isDependent: false,
            isMarried: false,
            aadharNumber: '',
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Name as per Aadhar"
                            placeholder="Enter name"
                            errorMessage={errors.name?.message}
                            isInvalid={!!errors.name}
                            variant="bordered"
                            isRequired
                        />
                    )}
                />

                {/* Relationship */}
                <Controller
                    name="relation"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            label="Relationship"
                            placeholder="Select relationship"
                            errorMessage={errors.relation?.message}
                            isInvalid={!!errors.relation}
                            variant="bordered"
                            selectedKeys={field.value ? [field.value] : []}
                            isRequired
                        >
                            <SelectItem key="Spouse" value="Spouse">Spouse</SelectItem>
                            <SelectItem key="Father" value="Father">Father</SelectItem>
                            <SelectItem key="Mother" value="Mother">Mother</SelectItem>
                            <SelectItem key="Son" value="Son">Son</SelectItem>
                            <SelectItem key="Daughter" value="Daughter">Daughter</SelectItem>
                        </Select>
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
                            isRequired
                        />
                    )}
                />

                {/* Phone Number */}

                <Controller
                    name="aadharNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Aadhar Number"
                            placeholder="Enter aadhar number"
                            errorMessage={errors.aadharNumber?.message}
                            isInvalid={!!errors.aadharNumber}
                            variant="bordered"
                        />
                    )}
                />
                <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Phone Number (Optional)"
                            placeholder="Enter phone number"
                            errorMessage={errors.phoneNumber?.message}
                            isInvalid={!!errors.phoneNumber}
                            variant="bordered"
                        />
                    )}
                />
                {/* Occupation */}
                <Controller
                    name="occupation"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label="Occupation (Optional)"
                            placeholder="Enter occupation"
                            errorMessage={errors.occupation?.message}
                            isInvalid={!!errors.occupation}
                            variant="bordered"
                        />
                    )}
                />

                {/* Add aadhar number field */}

                {/* Is Dependent */}
                <div className="flex flex-col gap-4">
                    <Controller
                        name="isDependent"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Checkbox
                                isSelected={value}
                                onValueChange={onChange}
                            >
                                Is Dependent?
                            </Checkbox>
                        )}
                    />
                    {(watch('relation') === 'Son' || watch('relation') === 'Daughter') && (
                        <Controller
                            name="isMarried"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <Checkbox
                                    isSelected={value}
                                    onValueChange={onChange}
                                >
                                    Is Married?
                                </Checkbox>
                            )}
                        />
                    )}
                </div>
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
                    Save
                </Button>
            </div>
        </form>
    );
};

export default FamilyMemberForm;
