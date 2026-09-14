import { AuthLayout } from '@/components/AuthLayout';
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';
export const metadata = { title: 'Reset password · SunSharp' };
export default async function ForgotPasswordPage({searchParams}:{searchParams:Promise<{error?:string}>}) {const {error}=await searchParams;return <AuthLayout title="Let’s get you back in." intro="Your family’s learning and little worlds will be here when you return." formTitle="Reset your password" formHint="We’ll help you get back to your account." switchHref="/login" switchLabel="Back to parent login →"><ForgotPasswordForm linkExpired={error==='link'}/></AuthLayout>;}
