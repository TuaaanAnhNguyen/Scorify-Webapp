export type SubscriptionType = "free" | "pro" | "enterprise";

export type AdminTeacher = {
  id: string;
  name: string;
  email: string;
  subscription: SubscriptionType;
  markedTests: number;
  pendingTests: number;
};

const STORAGE_KEY = "scorify_admin_teachers";

export function getAdminTeachers(): AdminTeacher[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveAdminTeachers(teachers: AdminTeacher[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
}

export function getAdminStats() {
  const teachers = getAdminTeachers();
  const totalUsers = teachers.length;
  const markedTests = teachers.reduce((sum, t) => sum + (t.markedTests ?? 0), 0);
  const pendingTests = teachers.reduce((sum, t) => sum + (t.pendingTests ?? 0), 0);
  return { totalUsers, markedTests, pendingTests };
}

export function ensureAdminData() {
  const teachers = getAdminTeachers();
  if (teachers.length === 0) {
    const sample: AdminTeacher[] = [
      {
        id: "t1",
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        subscription: "pro",
        markedTests: 24,
        pendingTests: 3,
      },
      {
        id: "t2",
        name: "Trần Thị B",
        email: "tranthib@example.com",
        subscription: "free",
        markedTests: 12,
        pendingTests: 5,
      },
    ];
    saveAdminTeachers(sample);
    return sample;
  }
  return teachers;
}
