import { experienceFor } from '@/lib/grade-experience';
import { gradeLabel, type Grade } from '@/lib/types';
export function GradeWelcome({grade}:{grade:Grade|null}) {const experience=experienceFor(grade);return <div className="grade-welcome"><span style={{background:experience.accent}} aria-hidden="true"/><p>{gradeLabel(grade)} <span aria-hidden="true">·</span> {experience.name}</p></div>;}
