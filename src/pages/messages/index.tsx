import React, { useState, useEffect, useRef } from "react";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search, MessageCircle, MoreVertical, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config";
import { Badge } from "@/components/ui/badge";

interface Message {
    id: number;
    content: string;
    createdAt: string;
    userId: string;
    recipientId: string;
    isPrivate: boolean;
    user: {
        id: string;
        name: string;
        image: string;
    };
}

interface Conversation {
    user: {
        id: string;
        name: string;
        image: string;
        role: string;
    };
    lastMessage: {
        content: string;
        createdAt: string;
        isMe: boolean;
        isRead: boolean;
    };
}

const MessagesPage = () => {
    const { data: identity } = useGetIdentity<User>();
    const [selectedUser, setSelectedUser] = useState<Conversation["user"] | null>(null);
    const [messageInput, setMessageInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [_socket, setSocket] = useState<Socket | null>(null);

    // Fetch Conversations
    const { result: conversationsResult, query: { refetch: refetchConversations } } = useCustom<{ data: Conversation[] }>({
        url: "/messages",
        method: "get",
        queryOptions: {
            enabled: !!identity,
            refetchInterval: 10000 // Poll every 10s for new conversation updates as a fallback
        }
    });

    // Fetch Messages for Selected User
    const { result: messagesResult, query: { refetch: refetchMessages } } = useCustom<{ data: Message[] }>({
        url: `/messages/${selectedUser?.id}`,
        method: "get",
        queryOptions: {
            enabled: !!selectedUser,
            refetchInterval: 3000 // Poll active chat frequently
        }
    });

    const { mutate: sendMessage } = useCustomMutation();

    // Socket Connection
    useEffect(() => {
        if (!identity?.id) return;
        const newSocket = io(SOCKET_URL, { query: { userId: identity.id }, withCredentials: true });
        setSocket(newSocket);

        newSocket.on("notification", (notification: any) => {
             if (notification.type === "message") {
                 void refetchConversations();
                 if (selectedUser) void refetchMessages();
             }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [identity?.id, selectedUser, refetchConversations, refetchMessages]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messagesResult]);

    const handleSend = () => {
        if (!messageInput.trim() || !selectedUser) return;

        sendMessage(
            {
                url: "/messages",
                method: "post",
                values: {
                    recipientId: selectedUser.id,
                    content: messageInput
                }
            },
            {
                onSuccess: () => {
                    setMessageInput("");
                    void refetchMessages();
                    void refetchConversations();
                }
            }
        );
    };

    const conversations = conversationsResult?.data?.data || [];
    const messages = messagesResult?.data?.data || [];

    return (
        <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
                {/* Sidebar: Conversations List */}
                <Card className="md:col-span-1 h-full flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-xl">
                    <div className="p-4 border-b border-border/50">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Messages
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search people..." className="pl-9 bg-background/50 border-border/50" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1 p-2">
                        <div className="space-y-2">
                            {conversations.length === 0 ? (
                                <div className="text-center p-4 text-muted-foreground text-sm">
                                    No conversations yet. Start a chat from the directory!
                                </div>
                            ) : (
                                conversations.map((conv: Conversation) => (
                                    <div
                                        key={conv.user.id}
                                        onClick={() => setSelectedUser(conv.user)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-primary/5",
                                            selectedUser?.id === conv.user.id ? "bg-primary/10" : ""
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border border-border/50">
                                                <AvatarImage src={conv.user.image} />
                                                <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {/* Online status indicator could go here */}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className="font-semibold text-sm truncate">{conv.user.name}</h3>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {conv.lastMessage.isMe && "You: "}{conv.lastMessage.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Main Chat Area */}
                <Card className="md:col-span-3 h-full flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-xl overflow-hidden">
                    {selectedUser ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card/30">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-border/50">
                                        <AvatarImage src={selectedUser.image} />
                                        <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold">{selectedUser.name}</h3>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                                            {selectedUser.role}
                                        </Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>

                            {/* Messages List */}
                            <ScrollArea className="flex-1 p-4 bg-background/30">
                                <div className="space-y-4">
                                    {messages.map((msg: Message) => {
                                        const isMe = msg.userId === identity?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex w-full",
                                                    isMe ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                                                        isMe
                                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                                            : "bg-white dark:bg-zinc-800 border border-border/50 rounded-bl-none"
                                                    )}
                                                >
                                                    <p>{msg.content}</p>
                                                    <span className={cn(
                                                        "text-[10px] block mt-1 text-right opacity-70",
                                                        isMe ? "text-primary-foreground/80" : "text-muted-foreground"
                                                    )}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-4 bg-card/30 border-t border-border/50">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-background/50 border-border/50 focus-visible:ring-primary"
                                    />
                                    <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Your Messages</h3>
                            <p className="max-w-sm">
                                Select a conversation from the left or search for a student/teacher to start chatting.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MessagesPage;
