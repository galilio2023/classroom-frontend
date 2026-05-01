import { useApiUrl, useCustom, useList } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TeacherChannelView } from "@/features/users/components/teacher-channel-view";
import { User, TeacherChannel, Class } from "@/types";
import { RefreshCw, Play, Info } from "lucide-react";
import { ListView } from "@/components/refine/views/list-view";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PublicChannelPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const apiUrl = useApiUrl();

  const { query: channelQuery } = useCustom<TeacherChannel & { teacher: User }>({
    url: `${apiUrl}/teacher-channels/public/${slug}`,
    method: "get",
  });

  const channelData = channelQuery.data?.data;
  const isChannelLoading = channelQuery.isLoading;
  const isError = channelQuery.isError;

  const { query: classesQuery } = useList<Class>({
    resource: "classes",
    filters: [
      {
        field: "teacherId",
        operator: "eq",
        value: channelData?.teacher?.id,
      },
    ],
    queryOptions: {
      enabled: !!channelData?.teacher?.id,
    },
  });

  const classesData = classesQuery.data?.data;
  const isClassesLoading = classesQuery.isLoading;

  if (isChannelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !channelData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
          <Info className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-tight">Channel Not Found</h1>
        <p className="text-muted-foreground max-w-sm">
          This teacher hasn't set up their public channel yet or the link is invalid.
        </p>
        <Button variant="outline" className="rounded-2xl" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  // 🛡️ RECONCILIATION: Map public channel data back to User object for the view
  const teacherWithChannel = {
    ...channelData.teacher,
    teacherChannel: channelData,
  };

  return (
    <div className="min-h-screen bg-background">
      <TeacherChannelView user={teacherWithChannel as User} teacherClasses={classesData || []} />
    </div>
  );
}
