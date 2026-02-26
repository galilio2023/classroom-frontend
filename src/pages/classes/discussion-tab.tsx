import { useList, useCreate, useDelete, useGetIdentity } from "@refinedev/core";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Discussion, User } from "@/types";
import { Loader2, MessageSquare, Send, Reply, Trash2, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "sonner";
import { io } from "socket.io-client";

dayjs.extend(relativeTime);

interface DiscussionTabProps {
  classId: string;
}

export const DiscussionTab = ({ classId }: DiscussionTabProps) => {
  const { data: identity } = useGetIdentity<User>();
  const [newPost, setNewPost] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // --- REFINE HOOKS ---
  const { result, query } = useList<Discussion>({
    resource: "discussions",
    filters: [
      { field: "classId", operator: "eq", value: classId },
      { field: "parentId", operator: "null", value: true },
    ],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!classId },
  });

  const discussions = result?.data || [];
  const isLoading = query.isLoading;
  const isFetching = query.isFetching;
  const refetch = query.refetch;

  // --- REAL-TIME SOCKET INTEGRATION ---
  useEffect(() => {
    if (!identity?.id || !classId) return;

    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      query: { userId: identity.id, classId },
    });

    socket.on("new_discussion", (post: Discussion) => {
      // We refetch to keep everything in sync with the DB
      // But we could also manually update the cache for "instant" feel
      refetch();
      if (post.userId !== identity.id) {
        toast.info(`New post from ${post.user.name}`);
      }
    });

    socket.on("delete_discussion", () => {
      refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [identity?.id, classId, refetch]);

  const { mutate: createPost, mutation } = useCreate<Discussion, any, any>();
  const isCreating = mutation.isPending;

  const { mutate: deletePost } = useDelete();

  const handlePost = () => {
    if (!newPost.trim()) return;
    createPost(
      {
        resource: "discussions",
        values: { content: newPost, classId: Number(classId) },
      },
      {
        onSuccess: () => {
          setNewPost("");
          toast.success("Post shared with class");
        },
      }
    );
  };

  const handleReply = (parentId: number) => {
    if (!replyContent.trim()) return;
    createPost(
      {
        resource: "discussions",
        values: { content: replyContent, classId: Number(classId), parentId },
      },
      {
        onSuccess: () => {
          setReplyTo(null);
          setReplyContent("");
          toast.success("Reply sent");
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deletePost(
      { resource: "discussions", id },
      {
        onSuccess: () => {
          toast.success("Message deleted");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Classroom Feed</h3>
          <p className="text-sm text-muted-foreground">Share updates and ask questions with your class.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Create Post Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarImage src={identity?.image ?? ""} />
              <AvatarFallback className="bg-primary text-primary-foreground">{identity?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea 
                placeholder="Write a message to the class..." 
                value={newPost} 
                onChange={(e) => setNewPost(e.target.value)} 
                className="min-h-[100px] bg-background resize-none focus-visible:ring-primary"
              />
              <div className="flex justify-end">
                <Button onClick={handlePost} disabled={!newPost.trim() || isCreating} className="px-8">
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discussion List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading discussions...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/30">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No messages yet.</p>
            <p className="text-sm">Be the first to start a conversation!</p>
          </div>
        ) : (
          discussions.map((post: Discussion) => (
            <Card key={post.id} className="group transition-all hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shadow-sm">
                    <AvatarImage src={post.user?.image ?? ""} />
                    <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{post.user?.name}</span>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5 capitalize">
                            {post.user?.role}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{dayjs(post.createdAt).fromNow()}</span>
                      </div>
                      {(identity?.id === post.userId || identity?.role === "admin") && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-primary" 
                        onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                      >
                        <Reply className="h-3 w-3 mr-1.5" />
                        {replyTo === post.id ? "Cancel" : "Reply"}
                      </Button>
                    </div>
                    
                    {replyTo === post.id && (
                      <div className="mt-4 space-y-3 bg-muted/50 p-3 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <Textarea 
                          placeholder="Write a reply..." 
                          value={replyContent} 
                          onChange={(e) => setReplyContent(e.target.value)} 
                          className="min-h-[80px] bg-background text-sm"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleReply(post.id)} disabled={!replyContent.trim()}>Send Reply</Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="mt-4 space-y-4 border-l-2 border-muted pl-4 ml-1">
                        {post.replies.map((reply: Discussion) => (
                          <div key={reply.id} className="group/reply flex gap-3 relative">
                            <Avatar className="h-7 w-7 shadow-xs">
                              <AvatarImage src={reply.user?.image ?? ""} />
                              <AvatarFallback className="text-[10px]">{reply.user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs">{reply.user?.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{dayjs(reply.createdAt).fromNow()}</span>
                                </div>
                                {(identity?.id === reply.userId || identity?.role === "admin") && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 opacity-0 group-hover/reply:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(reply.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs mt-1 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
