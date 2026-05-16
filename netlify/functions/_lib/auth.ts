/**
 * OWNER: P2 (Backend)
 * Demo-only "auth": we hardcode the teacher id. No real authentication for the hackathon.
 * Per Open Question Q8 in the plan, this is intentional.
 */
import { DEMO_TEACHER_ID } from '../../../shared/types';

export function currentTeacherId(): string {
  return process.env.KURSU_DEMO_TEACHER_ID ?? DEMO_TEACHER_ID;
}
