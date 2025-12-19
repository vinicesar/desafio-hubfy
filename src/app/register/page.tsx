"use client";

import { useAuth } from "@/hooks/useAuth";
import { type registerUserResultValue, registerUserSchema, registerUserInitialValue } from "@/types/typeRegister";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Container, Link, Paper, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, Form, useForm } from "react-hook-form";



export default function RegisterPage() {
    const router = useRouter();
    const { register: registerUser, isAuthenticated} = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        control,

    } = useForm<registerUserResultValue>({
        resolver: zodResolver(registerUserSchema),
    })

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const onSubmit = async (data: registerUserResultValue) => {
        const result = await registerUser(data.name, data.email, data.password)
        if (result.success) {
            router.push("/login")
        } else {
            setError("root", {message: result.error || "Erro ao registrar"})
        }
    }

    return (
        <Container maxWidth="sm">
            <Box className="min-h-screen flex items-center justify-center">
                <Paper elevation={3} className="p-4 w-full">
                    <Typography variant="h4" component={"h1"} gutterBottom align="center">
                        Criar conta
                    </Typography>
                    <Form<registerUserInitialValue, registerUserResultValue> 
                        control={control}
                        onSubmit={async ({data}) => {
                            onSubmit({
                               name: data.name, 
                               email: data.email,
                               password: data.password,
                               confirmPassword: data.confirmPassword
                            })
                        }}>
                            {errors.root && (
                                <Alert severity="error" sx={{mb: 2}}>
                                    {errors.root.message}
                                </Alert>
                            )}
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({field, fieldState}) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            sx={{mb:3}}
                                            label="Nome"
                                            variant="filled"
                                            error={fieldState.invalid}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({field, fieldState}) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            sx={{mb:3}}
                                            label="Email"
                                            variant="filled"
                                            error={fieldState.invalid}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({field, fieldState}) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            sx={{mb:3}}
                                            type="password"
                                            label="Password"
                                            variant="filled"
                                            error={fieldState.invalid}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    render={({field, fieldState}) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            sx={{mb:3}}
                                            type="password"
                                            label="Confirmar Senha"
                                            variant="filled"
                                            error={fieldState.invalid}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{mt:3, mg:2}}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Criando conta..." : "Criar Conta"}
                                </Button>

                                <Typography 
                                    variant="body2"
                                    align="center"
                                >
                                    Já tem uma conta?
                                    <Link 
                                        href="/login"
                                        underline="hover"
                                    >
                                        {" "}Faça login
                                    </Link>
                                </Typography>
                    </Form>
                </Paper>
            </Box>
        </Container>
    )
}