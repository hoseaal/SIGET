import { useState } from "react";
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import './page-auth.css'
import { AuthWrapper } from "./AuthWrapper";

const forgotSchema = z.object({
    email: z.string().email("Ingrese un email válido")
});

export const ForgotPasswordPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: '' }
    });

    const onSubmit = (data) => {
        console.log('Email submitted:', data.email);
    };

    return (
        <AuthWrapper>

            <h4 className="mb-2">Forgot Password? 🔒</h4>
            <p className="mb-4">Enter your email and we'll send you instructions to reset your password</p>
            <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="text"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        {...register("email")}
                        placeholder="Enter your email"
                        autoFocus />
                    {errors.email && <small className="text-danger">{errors.email.message}</small>}
                </div>
                <button aria-label='Click me' className="btn btn-primary d-grid w-100" type="submit">Send Reset Link</button>
            </form>
            <div className="text-center">
                <Link aria-label="Go to Login Page" to="/auth/login" className="d-flex align-items-center justify-content-center">
                    <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                    Back to login
                </Link>
            </div>

        </AuthWrapper>
    )
}
