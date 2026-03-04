import { useState, useMemo, useEffect } from "react";
import { useCustom, useCustomMutation, useNotification, useGetIdentity } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Enrollment, AttendanceStatus, Attendance, User, UserRole } from "@/types";
import { Loader2, Save, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, AlertCircle, History, ClipboardCheck, QrCode, Camera } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@/components/empty-state";
import { QRAttendanceModal } from "./qr-attendance-modal";
import { QRScannerModal } from "./qr-scanner-modal";

interface AttendanceTabProps {
  classId: string;
  enrollments: Enrollment[];
}

interface AttendanceHistoryGroup {
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    records: Attendance[];
}

export const AttendanceTab = ({ classId, enrollments }: AttendanceTabProps) => {
  const { data: identity } = useGetIdentity<User>();
  const isTeacher = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

  const { open } = useNotification();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  
  // QR Modals State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Fetch existing attendance for the selected date
  const { data: existingAttendance, isLoading: isFetching, refetch: refetchDaily } = useCustom<Attendance[]>({
    url: `/attendance`,
    method: "get",
    config: {
      query: {
        classId,
        date: selectedDate,
      },
    },
  }) as any;

  // Fetch attendance history
  const { data: historyData, isLoading: isHistoryLoading, refetch: refetchHistory } = useCustom<AttendanceHistoryGroup[]>({
    url: `/attendance/history/${classId}`,
    method: "get",
  }) as any;

  // Fetch overall stats
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useCustom<Record<AttendanceStatus, number>>({
    url: `/attendance/stats/${classId}`,
    method: "get",
  }) as any;

  // Initialize or update attendanceData when existingAttendance changes
  // Fixed: Use useEffect instead of useMemo to avoid React warnings and ensure state sync
  useEffect(() => {
    const initialData: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    
    // Default all to present
    enrollments.forEach((e) => {
      initialData[e.studentId] = { status: AttendanceStatus.PRESENT, remarks: "" };
    });

    // Overwrite with existing data if found
    if (existingAttendance?.data) {
      existingAttendance.data.forEach((record: Attendance) => {
        // Ensure we only map records for the currently selected date
        const recordDate = format(new Date(record.date), "yyyy-MM-dd");
        if (recordDate === selectedDate) {
            initialData[record.studentId] = { 
                status: record.status, 
                remarks: record.remarks || "" 
            };
        }
      });
    }
    setAttendanceData(initialData);
  }, [existingAttendance, enrollments, selectedDate]);

  const { mutate: saveAttendance, mutation } = useCustomMutation() as any;

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleSave = () => {
    const records = Object.entries(attendanceData).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks,
    }));

    saveAttendance(
      {
        url: "/attendance/bulk",
        method: "post",
        values: {
          classId,
          records,
          date: selectedDate,
        },
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: "Attendance Saved",
            description: `Attendance for ${selectedDate} has been updated successfully.`,
          });
          refetchDaily();
          refetchHistory();
          refetchStats();
        },
      }
    );
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case AttendanceStatus.ABSENT: return <XCircle className="h-4 w-4 text-destructive" />;
      case AttendanceStatus.LATE: return <Clock className="h-4 w-4 text-yellow-500" />;
      case AttendanceStatus.EXCUSED: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Present</Badge>;
      case AttendanceStatus.ABSENT: return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Absent</Badge>;
      case AttendanceStatus.LATE: return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Late</Badge>;
      case AttendanceStatus.EXCUSED: return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Excused</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-500">{statsData?.data?.present || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-destructive">{statsData?.data?.absent || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-500">{statsData?.data?.late || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Excused</p>
                <p className="text-2xl font-bold text-blue-500">{statsData?.data?.excused || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs defaultValue={isTeacher ? "mark" : "history"} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <TabsList>
              {isTeacher && (
                <TabsTrigger value="mark" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Mark Attendance
                </TabsTrigger>
              )}
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {isTeacher ? (
                <Button 
                  variant="outline" 
                  className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={() => setIsQRModalOpen(true)}
                >
                  <QrCode className="h-4 w-4" />
                  Start QR Attendance
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  className="gap-2 shadow-lg shadow-primary/20"
                  onClick={() => setIsScannerModalOpen(true)}
                >
                  <Camera className="h-4 w-4" />
                  Scan to Mark Present
                </Button>
              )}
            </div>
          </div>

          {isTeacher && (
            <TabsContent value="mark">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>Daily Attendance</CardTitle>
                    <CardDescription>Mark student presence for {format(new Date(selectedDate), "PPP")}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-none bg-transparent h-8 focus-visible:ring-0 w-32"
                      />
                    </div>
                    <Button onClick={handleSave} disabled={mutation.isPending} className="gap-2">
                      {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isFetching ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : enrollments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => {
                          const student = enrollment.student;
                          const data = attendanceData[student.id] || { status: AttendanceStatus.PRESENT, remarks: "" };

                          return (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={student.image || ""} />
                                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{student.name}</span>
                                    <span className="text-xs text-muted-foreground">{student.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={data.status}
                                  onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                                >
                                  <SelectTrigger className="w-[130px] h-9">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(data.status)}
                                      <SelectValue />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
                                    <SelectItem value={AttendanceStatus.ABSENT}>Absent</SelectItem>
                                    <SelectItem value={AttendanceStatus.LATE}>Late</SelectItem>
                                    <SelectItem value={AttendanceStatus.EXCUSED}>Excused</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Optional remarks..."
                                  value={data.remarks}
                                  onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                  className="h-9"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState
                      icon={ClipboardCheck}
                      title="No students enrolled"
                      description="You need to enroll students in this class before you can mark attendance."
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>
                  {isTeacher ? "View daily attendance summaries for the entire class." : "Your personal attendance record for this class."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isHistoryLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : historyData?.data?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        {isTeacher ? (
                          <>
                            <TableHead>Present</TableHead>
                            <TableHead>Absent</TableHead>
                            <TableHead>Late</TableHead>
                            <TableHead>Excused</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Status</TableHead>
                            <TableHead>Remarks</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData?.data?.map((group: AttendanceHistoryGroup) => (
                        <TableRow key={group.date}>
                          <TableCell className="font-medium">
                            {format(new Date(group.date), "PPP")}
                          </TableCell>
                          {isTeacher ? (
                            <>
                              <TableCell>
                                <Badge variant="outline" className="text-green-500 border-green-500/20">{group.present}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-destructive border-destructive/20">{group.absent}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">{group.late}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-blue-500 border-blue-500/20">{group.excused}</Badge>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>
                                {getStatusBadge(group.records[0].status)}
                              </TableCell>
                              <TableCell className="text-muted-foreground italic text-sm">
                                {group.records[0].remarks || "-"}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={History}
                    title="No attendance records"
                    description="Attendance history will appear here once you start marking student presence."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Modals */}
      <QRAttendanceModal 
        isOpen={isQRModalOpen} 
        onClose={() => {
          setIsQRModalOpen(false);
          refetchDaily();
          refetchHistory();
          refetchStats();
        }} 
        classId={classId} 
      />
      
      <QRScannerModal 
        isOpen={isScannerModalOpen} 
        onClose={() => {
          setIsScannerModalOpen(false);
          refetchDaily();
          refetchHistory();
          refetchStats();
        }} 
        classId={classId} 
      />
    </div>
  );
};
