import { useShow, useGetIdentity } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Shield, FileText, Loader2 } from "lucide-react";
import { User as UserType } from "@/types";

const UserShow = () => {
  const { id } = useParams();
  const { data: identity } = useGetIdentity<UserType>();
  
  const { query } = useShow<UserType & { phoneNumber?: string; address?: string; bio?: string }>({
    resource: "users",
    id,
  });

  const { data, isLoading, isError } = query;
  const user = data?.data;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <ShowView>
        <ShowViewHeader title="User not found" />
      </ShowView>
    );
  }

  const isSelf = identity?.id === user.id;
  const isAdmin = identity?.role === "admin";

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-primary/10 shadow-lg">
            <div className="h-24 bg-primary/10" />
            <CardContent className="relative pt-0 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 border-4 border-background -mt-12 shadow-xl">
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 space-y-1">
                <h2 className="text-xl font-black tracking-tight">{user.name}</h2>
                <Badge variant="secondary" className="capitalize font-bold px-3">
                  {user.role}
                </Badge>
              </div>
              
              <Separator className="my-6" />
              
              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-muted rounded-md"><Mail className="h-4 w-4 text-primary" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Email</span>
                    <span className="font-medium truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>

                {user.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-muted rounded-md"><Phone className="h-4 w-4 text-primary" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Phone</span>
                      <span className="font-medium">{user.phoneNumber}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-muted rounded-md"><Calendar className="h-4 w-4 text-primary" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Joined</span>
                    <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & Bio */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-primary/10 shadow-md h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>About</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Biography</h4>
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {user.bio || "No biography provided yet."}
                </p>
              </div>

              {user.address && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Location</h4>
                  <div className="flex items-start gap-2 text-sm text-foreground/80">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{user.address}</span>
                  </div>
                </div>
              )}

              {(isSelf || isAdmin) && (
                <div className="pt-6">
                  <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                    Private Information - Only visible to you and administrators
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserShow;
