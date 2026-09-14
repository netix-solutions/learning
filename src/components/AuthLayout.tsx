import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
export function AuthLayout({title,intro,formTitle,formHint,children,switchHref,switchLabel}:{title:string;intro:string;formTitle:string;formHint?:string;children:ReactNode;switchHref?:string;switchLabel?:string}) {return <main className="auth-page"><section className="auth-intro"><BrandLogo/><h1>{title}</h1><p>{intro}</p><div className="auth-art"><Image src="/images/ui/discovery.webp" alt="" fill unoptimized className="object-contain"/></div></section><div><section className="auth-form-panel"><h2>{formTitle}</h2>{formHint&&<p>{formHint}</p>}{children}</section>{switchHref&&<Link className="auth-switch" href={switchHref}>{switchLabel}</Link>}</div></main>;}
