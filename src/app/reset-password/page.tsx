import Link from 'next/link';
import { getSessionProfile } from '@/lib/auth';
import { AuthLayout } from '@/components/AuthLayout';
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
export const metadata={title:'Choose a new password · SunSharp'};
export const dynamic='force-dynamic';
export default async function ResetPasswordPage(){const {user}=await getSessionProfile();return <AuthLayout title="A fresh start." intro="Choose a new password and get back to your family’s discoveries." formTitle="Choose a new password" formHint="Keep your family account secure.">{user?<ResetPasswordForm/>:<div><p className="text-slate-600">This reset link is invalid or has expired. Request a new link to continue.</p><Link href="/forgot-password" className="mt-5 inline-flex min-h-12 items-center font-bold text-teal-800 underline">Request a new link →</Link></div>}</AuthLayout>;}
