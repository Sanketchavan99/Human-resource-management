import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
import { passwordLoginSchema } from '../schemas/authSchemas';

const LoginWithPassword = () => {
    const navigate = useNavigate();
    const { loginWithPassword } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(passwordLoginSchema),
        defaultValues: {
            empCode: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        try {
            const response = await loginWithPassword(data.empCode, data.password);

            if (response?.data?.success) {
                const user = response.data.user;
                // Redirect based on role
                const userRole = (user.role || '').toLowerCase();
                if (userRole === 'admin') {
                    navigate('/admin');
                } else if (userRole === 'employer') {
                    navigate('/company/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(response?.data?.message || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-default-50 px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="flex flex-col gap-3 items-center pt-8 pb-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                        <Icon icon="lucide:log-in" width="32" height="32" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
                    <p className="text-default-500 text-center">
                        Please login to your account
                    </p>
                </CardHeader>

                <CardBody className="px-8 pb-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                        <Controller
                            name="empCode"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Employee Code"
                                    placeholder="Enter your employee code"
                                    variant="bordered"
                                    startContent={
                                        <Icon icon="lucide:user" className="text-default-400" />
                                    }
                                    errorMessage={errors.empCode?.message}
                                    isInvalid={!!errors.empCode}
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    label="Password"
                                    placeholder="Enter your password"
                                    variant="bordered"
                                    startContent={
                                        <Icon icon="lucide:lock" className="text-default-400" />
                                    }
                                    endContent={
                                        <button
                                            className="focus:outline-none"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <Icon
                                                icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'}
                                                className="text-default-400 cursor-pointer"
                                            />
                                        </button>
                                    }
                                    errorMessage={errors.password?.message}
                                    isInvalid={!!errors.password}
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
                            className="mt-2 font-semibold"
                            isLoading={loading}
                        >
                            Login
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-default-500">
                        New user?{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            Register here
                        </Link>
                    </div>

                    <div className="mt-3 text-center text-sm text-default-500">
                        Having trouble logging in?{' '}
                        <Link to="/enquiry" className="text-primary hover:underline font-medium">
                            Contact Support
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default LoginWithPassword;
