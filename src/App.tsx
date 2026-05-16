/**
 * OWNER: P1 (Frontend)
 * Top-level layout + routes.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Landing } from '@/pages/Landing';
import { TeacherDashboard } from '@/pages/TeacherDashboard';
import { TeacherNewLecture } from '@/pages/TeacherNewLecture';
import { TeacherLectureDetail } from '@/pages/TeacherLectureDetail';
import { TeacherLectureLive } from '@/pages/TeacherLectureLive';
import { TeacherLectureFeedback } from '@/pages/TeacherLectureFeedback';
import { StudentJoin } from '@/pages/StudentJoin';
import { StudentLectureLive } from '@/pages/StudentLectureLive';
import { StudentLecturePost } from '@/pages/StudentLecturePost';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/lectures/new" element={<TeacherNewLecture />} />
        <Route path="/teacher/lectures/:id" element={<TeacherLectureDetail />} />
        <Route path="/teacher/lectures/:id/live" element={<TeacherLectureLive />} />
        <Route path="/teacher/lectures/:id/feedback" element={<TeacherLectureFeedback />} />

        <Route path="/student" element={<StudentJoin />} />
        <Route path="/student/lectures/:code" element={<StudentLectureLive />} />
        <Route path="/student/lectures/:code/post" element={<StudentLecturePost />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
