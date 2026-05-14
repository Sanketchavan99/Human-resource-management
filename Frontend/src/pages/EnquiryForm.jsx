import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Input,
    Button,
    Card,
    CardBody,
    CardHeader,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { enquirySchema } from '../schemas/enquirySchemas';
import authService from '../services/authService';

const EnquiryForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            name: '',
            mailId: '',
            phoneNumber: '',
            companyName: '',
            state: '',
            city: '',
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await authService.createEnquiry(data);

            if (response?.data?.success) {
                setSuccess(true);
                reset();
                // Show success message for 3 seconds then navigate
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                setError(response?.data?.message || 'Failed to submit enquiry. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-default-50 px-4 py-8">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="flex flex-col gap-3 items-center pt-8 pb-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                        <Icon icon="lucide:mail" width="32" height="32" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Contact Us</h1>
                    <p className="text-default-500 text-center">
                        Interested in our HR Management solutions? Fill out the form below and we'll get back to you soon.
                    </p>
                </CardHeader>

                <CardBody className="px-8 pb-8">
                    {success ? (
                        <div className="p-6 rounded-lg bg-success/10 text-success text-center">
                            <Icon icon="lucide:check-circle" width="48" height="48" className="mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                            <p>Your enquiry has been submitted successfully. We'll contact you soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Full Name"
                                        placeholder="Enter your full name"
                                        variant="bordered"
                                        startContent={
                                            <Icon icon="lucide:user" className="text-default-400" />
                                        }
                                        errorMessage={errors.name?.message}
                                        isInvalid={!!errors.name}
                                    />
                                )}
                            />

                            <Controller
                                name="mailId"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="email"
                                        label="Email Address"
                                        placeholder="Enter your email"
                                        variant="bordered"
                                        startContent={
                                            <Icon icon="lucide:mail" className="text-default-400" />
                                        }
                                        errorMessage={errors.mailId?.message}
                                        isInvalid={!!errors.mailId}
                                    />
                                )}
                            />

                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="tel"
                                        label="Phone Number"
                                        placeholder="Enter your phone number"
                                        variant="bordered"
                                        startContent={
                                            <Icon icon="lucide:phone" className="text-default-400" />
                                        }
                                        errorMessage={errors.phoneNumber?.message}
                                        isInvalid={!!errors.phoneNumber}
                                    />
                                )}
                            />

                            <Controller
                                name="companyName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Company Name"
                                        placeholder="Enter your company name"
                                        variant="bordered"
                                        startContent={
                                            <Icon icon="lucide:building-2" className="text-default-400" />
                                        }
                                        errorMessage={errors.companyName?.message}
                                        isInvalid={!!errors.companyName}
                                    />
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="City"
                                            placeholder="Enter city"
                                            variant="bordered"
                                            startContent={
                                                <Icon icon="lucide:map-pin" className="text-default-400" />
                                            }
                                            errorMessage={errors.city?.message}
                                            isInvalid={!!errors.city}
                                        />
                                    )}
                                />

                                <Controller
                                    name="state"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="State"
                                            placeholder="Enter state"
                                            variant="bordered"
                                            startContent={
                                                <Icon icon="lucide:map" className="text-default-400" />
                                            }
                                            errorMessage={errors.state?.message}
                                            isInvalid={!!errors.state}
                                        />
                                    )}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm flex items-center gap-2">
                                    <Icon icon="lucide:alert-circle" width="16" height="16" />
                                    {error}
                                </div>
                            )}

                            <Button
                                color="primary"
                                type="submit"
                                size="lg"
                                className="mt-2 font-semibold"
                                isLoading={loading}
                            >
                                Submit Enquiry
                            </Button>

                            <div className="text-center text-sm text-default-500">
                                Already have an account?{' '}
                                <a href="/login" className="text-primary hover:underline">
                                    Login here
                                </a>
                            </div>
                        </form>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default EnquiryForm;
