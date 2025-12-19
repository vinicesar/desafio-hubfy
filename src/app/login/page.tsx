"use client";

import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, Form, useForm } from "react-hook-form";
import { loginSchema, type loginTypeResultValue, type loginTypeInitialValue } from "../../types/typeLogin";
import { useEffect } from "react";
import { Alert, Box, Button, Container, Link, Paper, TextField, Typography } from "@mui/material";

export default function LoginPage(){
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const {
        formState: {errors,isSubmitting},
        control,
        setError,
    } = useForm<loginTypeResultValue>({
        resolver: zodResolver(loginSchema)
    })

    useEffect(() => {
        if (isAuthenticated){
            router.push("dashboard")
        }
    }, [isAuthenticated, router]);

    const onSubmit = async (data:loginTypeResultValue) => {
        const result = await login(data.email, data.password)
        if (!result.success) {
            setError("root", {message: result.error || "Erro ao fazer login"})
        }
    }

    return (
        <Container maxWidth="sm">
                <Box className="min-h-screen flex items-center justify-center">
                    <Paper elevation={3} className="p-4 w-full">
                        <Typography variant="h4" component="h1" gutterBottom align="center">
                            Login
                        </Typography>
                        <Form< loginTypeInitialValue, loginTypeResultValue> 
                            control={control} 
                            onSubmit={async ({data}) =>{
                            onSubmit({
                                email: data.email,
                                password: data.password
                                })}}>

                                {errors.root && (
                                    <Alert severity="error" sx={{mb: 2}}>
                                        {errors.root.message}
                                    </Alert>
                                )}
                                    
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
                                            label="Senha"
                                            type="password"
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
                                    sx={{mt:3, mb:2}}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Entrando..." : "Entrar"}
                                </Button>

                                <Typography variant="body2" align="center">
                                    Não tem uma conta?
                                    <Link href="/register" underline="hover">
                                        {" "}Registre-se
                                    </Link>
                                </Typography>
                        </Form>
                    </Paper>
                </Box>
            </Container>
    )
}
