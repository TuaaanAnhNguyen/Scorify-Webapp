import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  FileCheck, 
  User, 
  Download,
  ExternalLink,
  GraduationCap,
  Clock,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

const MOCK_SUBMISSIONS = [
  { id: "s-1", studentName: "Nguyễn Văn An", className: "Lớp 12A3", score: 8.5, date: "17/06/2026", status: "Chấm xong" },
  { id: "s-2", studentName: "Lê Hoàng Minh", className: "Lớp 12A3", score: 6.0, date: "17/06/2026", status: "Chấm xong" },
  { id: "s-3", studentName: "Trần Thị Hồng", className: "Lớp 10 L1", score: 9.2, date: "16/06/2026", status: "Chấm xong" },
  { id: "s-4", studentName: "Phạm Minh Đức", className: "Lớp 11B5", score: 7.4, date: "15/06/2026", status: "Chấm xong" },
  { id: "s-5", studentName: "Đặng Hoàng Việt", className: "Lớp 12A3", score: 8.0, date: "14/06/2026", status: "Chấm xong" },
];

export function RubricDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rubric, setRubric] = React.useState<any>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("scorify_mock_rubrics");
    if (saved) {
      const list = JSON.parse(saved);
      const item = list.find((r: any) => r.id === id);
      if (item) {
        setRubric(item);
      } else {
        // Fallback for demo
        setRubric({
          id,
          title: "Đề khảo sát Đột phá Hình học Giải tích Không gian",
          grade: "Lớp 12",
          examFileName: "De_thi_Toan_HK2_Khoi12.pdf",
          rubricFileName: "Barem_cham_Toan_HK2.pdf",
          linkedFolders: 2
        });
      }
    }
  }, [id]);

  if (!rubric) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/rubrics")} 
            className="rounded-xl border border-slate-200 bg-white size-9 text-slate-500"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{rubric.title}</h1>
              <Badge className="bg-slate-100 text-slate-600 font-bold text-[10px] rounded px-2 py-0.5">
                {rubric.grade}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-slate-400" />
              Sử dụng gần nhất: {rubric.lastUsed || "Vừa xong"}
            </p>
          </div>
        </div>

        <Link to={`/rubrics/${id}/edit`}>
          <Button variant="outline" className="text-xs font-bold rounded-xl h-10 px-4 border-slate-200">
            Chỉnh sửa bài tập
          </Button>
        </Link>
      </div>

      {/* Files Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="size-4 text-indigo-500" />
              File PDF Đề thi
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold">
              <Download className="size-3.5 mr-1" /> Tải xuống
            </Button>
          </CardHeader>
          <CardContent className="p-4 bg-slate-50/50">
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
              <div className="size-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{rubric.examFileName || "De_thi_chinh_thuc.pdf"}</p>
                <p className="text-[10px] text-slate-400">1.2 MB • Định dạng PDF</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-indigo-600">
                <ExternalLink className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileCheck className="size-4 text-emerald-500" />
              File PDF Đáp án & Rubric
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold">
              <Download className="size-3.5 mr-1" /> Tải xuống
            </Button>
          </CardHeader>
          <CardContent className="p-4 bg-slate-50/50">
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
              <div className="size-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <FileCheck className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{rubric.rubricFileName || "Barem_cham_chi_tiet.pdf"}</p>
                <p className="text-[10px] text-slate-400">0.8 MB • Định dạng PDF</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:text-emerald-600">
                <ExternalLink className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Section */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="pb-0 border-b border-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="size-4 text-slate-400" />
              Danh sách bài làm của học sinh
            </CardTitle>
            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 font-bold text-[10px] rounded px-2 py-0.5">
              Tổng số {MOCK_SUBMISSIONS.length} bài nộp
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-bold text-slate-500 px-6">Tên học sinh</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500">Lớp học / Thư mục</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500">Ngày nộp</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 text-center">Trạng thái</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 text-right px-6">Điểm số</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SUBMISSIONS.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-slate-50/40 text-xs">
                  <TableCell className="font-bold text-slate-800 px-6 flex items-center gap-2 py-4">
                    <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="size-3.5" />
                    </div>
                    {sub.studentName}
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-indigo-400" />
                      {sub.className}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {sub.date}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="size-2.5" />
                      {sub.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {sub.score.toFixed(1)} / 10
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}