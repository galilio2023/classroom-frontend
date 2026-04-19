import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PeerReviewForm } from "@/features/assignments/components/peer-review-form";
import { Assignment, PeerReview } from "@/types";

interface PeerReviewSectionProps {
  assignment: Assignment;
  assignedReviews: PeerReview[];
  onSuccess: () => void;
}

export const PeerReviewSection = ({
  assignment,
  assignedReviews,
  onSuccess,
}: PeerReviewSectionProps) => {
  const { t } = useTranslation();

  return (
    <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl bg-amber-500/[0.02]">
      <CardHeader className="bg-amber-500/5 p-8 md:p-10 border-b border-amber-500/10">
        <CardTitle className="text-amber-600 flex items-center gap-4 font-black uppercase tracking-widest text-xl text-start">
          <Users className="h-8 w-8" /> {t("assignments.show.peersAssigned" as any)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 md:p-10">
        {assignedReviews.length > 0 ? (
          <div className="space-y-10">
            {assignedReviews.map((review: any) => (
              <div
                key={review.id}
                className="p-8 rounded-4xl border-2 border-dashed border-amber-500/20 space-y-6 bg-card text-start"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-amber-500/20">
                    <AvatarFallback className="bg-amber-500/10 text-amber-600 font-bold">
                      {review.submission?.student?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-black text-lg">
                      {t("assignments.show.peerReviewerAnonymous" as any, "Peer Reviewer")}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">
                      {(review as any).status === "completed"
                        ? t("status.completed" as any)
                        : t("status.pending" as any)}
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-muted/20 rounded-2xl italic border border-border/40 font-medium">
                  {review.submission?.content}
                </div>
                <PeerReviewForm review={review} assignment={assignment} onSuccess={onSuccess} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 opacity-60">
            <div className="p-6 rounded-full bg-amber-500/10 text-amber-600">
              <Users className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight">
                {t("assignments.show.noReviewsYet" as any, "No Reviews Assigned Yet")}
              </h3>
              <p className="max-w-md mx-auto font-medium text-muted-foreground">
                {t(
                  "assignments.show.noReviewsDesc" as any,
                  "Once the teacher closes the submission window and assigns peer reviews, you will see your classmates' work here for evaluation."
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
