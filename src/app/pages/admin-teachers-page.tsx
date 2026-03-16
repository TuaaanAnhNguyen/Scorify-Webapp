import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit3, CheckCircle2, XCircle } from "lucide-react";
import { AdminTeacher, getAdminTeachers, saveAdminTeachers, ensureAdminData, SubscriptionType } from "../utils/admin";

const subscriptionOptions: { value: SubscriptionType; label: string }[] = [
  { value: "free", label: "Miễn phí" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

function newTeacher() {
  return {
    id: `t-${Date.now()}`,
    name: "",
    email: "",
    subscription: "free" as SubscriptionType,
    markedTests: 0,
    pendingTests: 0,
  };
}

export function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AdminTeacher>(newTeacher());

  useEffect(() => {
    ensureAdminData();
    setTeachers(getAdminTeachers());
  }, []);

  const selectedTeacher = useMemo(() => teachers.find((t) => t.id === selectedId) ?? null, [teachers, selectedId]);

  const saveTeachers = (next: AdminTeacher[]) => {
    saveAdminTeachers(next);
    setTeachers(next);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setEditing(false);
  };

  const startCreate = () => {
    setSelectedId(null);
    setEditing(true);
    setForm(newTeacher());
  };

  const startEdit = (teacher: AdminTeacher) => {
    setSelectedId(teacher.id);
    setEditing(true);
    setForm(teacher);
  };

  const handleSave = () => {
    const next = selectedId ? teachers.map((t) => (t.id === selectedId ? form : t)) : [...teachers, form];
    saveTeachers(next);
    setSelectedId(form.id);
    setEditing(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa giáo viên này?")) return;
    const next = teachers.filter((t) => t.id !== id);
    saveTeachers(next);
    if (selectedId === id) {
      setSelectedId(null);
      setEditing(false);
    }
  };

  const stats = useMemo(() => {
    const total = teachers.length;
    const marked = teachers.reduce((sum, t) => sum + (t.markedTests ?? 0), 0);
    const pending = teachers.reduce((sum, t) => sum + (t.pendingTests ?? 0), 0);
    return { total, marked, pending };
  }, [teachers]);

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý giáo viên</h1>
          <p className="text-gray-600">Tại đây bạn có thể tạo, sửa, xóa và xem thông tin giáo viên.</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#F05123] text-white px-4 py-2 rounded-lg hover:bg-[#D9471E]"
        >
          <Plus className="size-5" />
          Tạo giáo viên mới
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">Tổng giáo viên</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">Bài đã chấm</div>
              <div className="text-2xl font-bold text-gray-900">{stats.marked}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">Bài chờ</div>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách giáo viên</h2>
              <span className="text-xs text-gray-500">Nhấp vào tên để xem chi tiết</span>
            </div>
            <div className="divide-y divide-gray-100">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleSelect(teacher.id)}
                  className={`w-full text-left px-6 py-4 hover:bg-gray-50 flex items-center justify-between ${
                    selectedId === teacher.id ? "bg-orange-50" : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold text-gray-900">{teacher.name || "(Chưa có tên)"}</div>
                    <div className="text-xs text-gray-500">{teacher.email || "(Chưa có email)"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {subscriptionOptions.find((o) => o.value === teacher.subscription)?.label}
                    </span>
                    <Edit3 className="size-4 text-gray-400" />
                  </div>
                </button>
              ))}
              {teachers.length === 0 && (
                <div className="px-6 py-10 text-center text-gray-500">
                  Chưa có giáo viên nào. Nhấn "Tạo giáo viên mới" để bắt đầu.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chi tiết giáo viên</h2>
              {selectedTeacher && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 text-[#F05123] hover:text-[#D9471E]"
                >
                  <Edit3 className="size-5" />
                  Sửa
                </button>
              )}
            </div>

            {selectedTeacher ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Tên</div>
                  <div className="text-sm font-medium text-gray-900">{selectedTeacher.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-sm font-medium text-gray-900">{selectedTeacher.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Gói đăng ký</div>
                  <div className="text-sm font-medium text-gray-900">
                    {subscriptionOptions.find((o) => o.value === selectedTeacher.subscription)?.label}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Bài đã chấm</div>
                    <div className="text-sm font-medium text-gray-900">{selectedTeacher.markedTests}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Bài chờ</div>
                    <div className="text-sm font-medium text-gray-900">{selectedTeacher.pendingTests}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => selectedTeacher && handleDelete(selectedTeacher.id)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg py-2"
                >
                  <Trash2 className="size-5" />
                  Xóa giáo viên
                </button>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Chọn một giáo viên từ danh sách để xem chi tiết và chỉnh sửa.
              </div>
            )}
          </div>

          {editing && (
            <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedId ? "Sửa giáo viên" : "Tạo giáo viên"}</h3>
                  <p className="text-xs text-gray-500">Điền thông tin sau rồi lưu lại.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                    placeholder="teacher@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gói đăng ký</label>
                  <select
                    value={form.subscription}
                    onChange={(e) => setForm({ ...form, subscription: e.target.value as SubscriptionType })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                  >
                    {subscriptionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bài đã chấm</label>
                    <input
                      type="number"
                      value={form.markedTests}
                      min={0}
                      onChange={(e) => setForm({ ...form, markedTests: Number(e.target.value) })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bài chờ</label>
                    <input
                      type="number"
                      value={form.pendingTests}
                      min={0}
                      onChange={(e) => setForm({ ...form, pendingTests: Number(e.target.value) })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-[#F05123] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 bg-[#F05123] text-white px-4 py-2 rounded-lg hover:bg-[#D9471E]"
                  >
                    <CheckCircle2 className="size-5" />
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
