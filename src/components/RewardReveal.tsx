import type { ReactNode } from 'react';
export function RewardReveal({owned,children}:{owned:boolean;children:ReactNode}){
 return <div className={`reward-reveal ${owned?'':'reward-unowned'}`} data-reward-owned={owned}><div className="reward-reveal-art">{children}</div>{!owned&&<span className="reward-reveal-label">Not collected yet</span>}</div>;
}
