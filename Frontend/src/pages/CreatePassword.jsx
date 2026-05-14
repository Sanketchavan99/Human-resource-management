import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button, Card, CardBody, CardHeader } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { passwordSchema } from '../schemas/authSchemas';
import PasswordStrengthIndicator from '../components/ui/PasswordStrengthIndicator';

const CreatePassword = () => {
    const navigate = useNavigate();
    const { setPassword, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);
    const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const response = await setPassword(data.password);

            if (response.success) {
                // Redirect based on role (case-insensitive)
                const userRole = (user?.role || '').toLowerCase();
                if (userRole === 'admin') {
                    navigate('/admin');
                } else if (userRole === 'employer') {
                    navigate('/company/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(response.message || 'Failed to set password.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-default-50 px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="flex flex-col gap-3 items-center pt-8 pb-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                        <Icon icon="lucide:lock" width="32" height="32" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Create Password</h1>
                    <p className="text-default-500 text-center">
                        Secure your account with a strong password
                    </p>
                </CardHeader>

                <CardBody className="px-8 pb-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="New Password"
                                        placeholder="Enter new password"
                                        variant="bordered"
                                        endContent={
                                            <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                                {isVisible ? (
                                                    <Icon icon="lucide:eye-off" className="text-2xl text-default-400 pointer-events-none" />
                                                ) : (
                                                    <Icon icon="lucide:eye" className="text-2xl text-default-400 pointer-events-none" />
                                                )}
                                            </button>
                                        }
                                        type={isVisible ? "text" : "password"}
                                        errorMessage={errors.password?.message}
                                        isInvalid={!!errors.password}
                                    />
                                )}
                            />
                            <PasswordStrengthIndicator password={password} />
                        </div>

                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Confirm Password"
                                    placeholder="Confirm new password"
                                    variant="bordered"
                                    endContent={
                                        <button className="focus:outline-none" type="button" onClick={toggleConfirmVisibility}>
                                            {isConfirmVisible ? (
                                                <Icon icon="lucide:eye-off" className="text-2xl text-default-400 pointer-events-none" />
                                            ) : (
                                                <Icon icon="lucide:eye" className="text-2xl text-default-400 pointer-events-none" />
                                            )}
                                        </button>
                                    }
                                    type={isConfirmVisible ? "text" : "password"}
                                    errorMessage={errors.confirmPassword?.message}
                                    isInvalid={!!errors.confirmPassword}
                                />
                            )}
                        />

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
                            className="w-full font-semibold"
                            isLoading={loading}
                        >
                            Set Password & Continue
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default CreatePassword;
