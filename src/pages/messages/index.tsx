import React, { useState, useEffect, useRef } from "react";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search, MessageCircle, MoreVertical, Paperclip, ChevronLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar as arLocale, enUS as enLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { useSearchParams } from "react-router-dom";
import { socket, connectSocket } from "@/lib/socket";

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
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    usePageTitle(t("messages.title"));
    const { data: identity } = useGetIdentity<User>();
    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get("userId");
    
    const [selectedUser, setSelectedUser] = useState<Conversation["user"] | null>(null);
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null); 

    const dateLocale = isAr ? arLocale : enLocale;
    
    // Unified Socket Initialization
    useEffect(() => {
        if (identity) {
            void connectSocket();
        }
    }, [identity]);

    // Fetch Conversations
    const { result: conversationsResult, query: { refetch: refetchConversations, isLoading: isLoadingConversations } } = useCustom<{ data: Conversation[] }>({
        url: "/messages",
        method: "get",
        queryOptions: {
            enabled: !!identity,
            refetchInterval: 10000 
        }
    });

    const conversations = conversationsResult?.data?.data || [];

    // Auto-select user from searchParams (Notification deep-link)
    useEffect(() => {
        if (targetUserId && conversations.length > 0) {
            const existingConv = conversations.find(c => c.user.id === targetUserId);
            if (existingConv) {
                setSelectedUser(existingConv.user);
            }
        }
    }, [targetUserId, conversations]);

    // Fetch Target User if not in conversations (Start new chat)
    const { result: targetUserResult } = useCustom<{ data: Conversation["user"] }>({
        url: `/messages/user/${targetUserId}`,
        method: "get",
        queryOptions: {
            enabled: !!targetUserId && !conversations.find(c => c.user.id === targetUserId),
        }
    });

    useEffect(() => {
        if (targetUserResult?.data?.data) {
            setSelectedUser(targetUserResult.data.data);
        }
    }, [targetUserResult]);

    // Fetch Messages for Selected User
    const { result: messagesResult, query: { refetch: refetchMessages, isLoading: isLoadingMessages } } = useCustom<{ data: Message[] }>({
        url: `/messages/${selectedUser?.id}`,
        method: "get",
        queryOptions: {
            enabled: !!selectedUser,
            refetchInterval: 3000 
        }
    });

    const { mutate: sendMessage } = useCustomMutation();

    // Socket Connection
    useEffect(() => {
        if (!identity?.id) return;

        const handleMsgNotification = (notification: any) => {
             if (notification.type === "message") {
                 void refetchConversations();
                 if (selectedUser) void refetchMessages();
             }
        };

        socket.on("notification", handleMsgNotification);

        return () => {
            socket.off("notification", handleMsgNotification);
        };
    }, [identity?.id, selectedUser, refetchConversations, refetchMessages]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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

    const messages = messagesResult?.data?.data || [];

    return (
        <div className="container mx-auto py-6 md:py-8 h-[calc(100vh-4rem)] max-w-screen-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 h-full">
                {/* Sidebar: Conversations List */}
                <motion.div
                    initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "md:col-span-1 lg:col-span-2 h-full flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-3xl rounded-[2.5rem]",
                        selectedUser ? "hidden md:flex" : "flex"
                    )}
                >
                    <CardHeader className="p-6 md:p-8 pb-4 border-b border-border/40">
                        <CardTitle className="text-2xl md:text-3xl font-black flex items-center gap-3">
                            <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                            {t("messages.title")}
                        </CardTitle>
                        <p className="text-muted-foreground font-medium text-sm md:text-base">{t("messages.description")}</p>
                    </CardHeader>
                    <div className="p-4 md:p-6 border-b border-border/40">
                        <div className="relative group">
                            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors", "start-4")} />
                            <Input 
                                placeholder={t("messages.searchPeople")} 
                                className={cn("bg-background/50 border-border/40 h-12 rounded-xl shadow-sm", "ps-11 pe-4")} 
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1 p-4 md:p-6">
                        <div className="space-y-3">
                            {isLoadingConversations ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 animate-pulse">
                                        <div className="h-10 w-10 rounded-full bg-muted/40" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 bg-muted/40 rounded" />
                                            <div className="h-3 w-1/2 bg-muted/40 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : conversations.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground text-base">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    {t("messages.noConversations")}
                                </div>
                            ) : (
                                conversations.map((conv: Conversation) => (
                                    <div
                                        key={conv.user.id}
                                        onClick={() => setSelectedUser(conv.user)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-primary/5 border border-transparent hover:border-primary/10 shadow-sm",
                                            selectedUser?.id === conv.user.id ? "bg-primary/10 border-primary/20" : "bg-background/50"
                                        )}
                                    >
                                        <div className="relative shrink-0">
                                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                                <AvatarImage src={conv.user.image} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{conv.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {!conv.lastMessage.isRead && !conv.lastMessage.isMe && (
                                                <div className="absolute -top-1 -end-1 size-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className="font-bold text-base truncate">{conv.user.name}</h3>
                                                <span className="text-[10px] text-muted-foreground/60">
                                                    {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false, locale: dateLocale })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground/80 truncate">
                                                {conv.lastMessage.isMe && <span className="font-bold text-primary/80">{t("messages.you")}: </span>}{conv.lastMessage.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </motion.div>

                {/* Main Chat Area */}
                <motion.div
                    initial={{ opacity: 0, x: isAr ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "md:col-span-3 lg:col-span-3 h-full flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-3xl rounded-[2.5rem]",
                        selectedUser ? "flex" : "hidden md:flex"
                    )}
                >
                    {selectedUser ? (
                        <>
                            {/* Header */}
                            <div className="p-4 md:p-6 border-b border-border/40 flex justify-between items-center bg-card/30">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                        <AvatarImage src={selectedUser.image} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">{selectedUser.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-start">
                                        <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 capitalize rounded-full shadow-sm">
                                            {selectedUser.role}
                                        </Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>

                            {/* Messages List */}
                            <ScrollArea className="flex-1 p-4 md:p-6 bg-background/30">
                                <div className="space-y-4">
                                    {isLoadingMessages ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                                                <div className="max-w-[60%] rounded-2xl px-4 py-2 bg-muted/30 animate-pulse h-16 w-full" />
                                            </div>
                                        ))
                                    ) : messages.length === 0 ? (
                                        <div className="text-center p-8 text-muted-foreground text-base">
                                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                            {t("messages.noMessages")}
                                        </div>
                                    ) : (
                                        messages.map((msg: Message) => {
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
                                                            "max-w-[70%] rounded-2xl px-4 py-2 text-sm md:text-base shadow-sm",
                                                            isMe
                                                                ? "bg-primary text-primary-foreground ltr:rounded-br-none rtl:rounded-bl-none"
                                                                : "bg-white dark:bg-muted/10 border border-border/40 ltr:rounded-bl-none rtl:rounded-br-none"
                                                        )}
                                                    >
                                                        <p className="text-start leading-relaxed">{msg.content}</p>
                                                        <span className={cn(
                                                            "text-[10px] block mt-1 opacity-70",
                                                            "text-end",
                                                            isMe ? "text-primary-foreground/80" : "text-muted-foreground"
                                                        )}>
                                                            {new Date(msg.createdAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-4 md:p-6 bg-card/30 border-t border-border/40">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="flex items-center gap-3"
                                >
                                    <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-10 w-10 rounded-xl">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder={t("messages.typeMessage")}
                                        className="flex-1 bg-background/50 border-border/40 focus-visible:ring-primary h-12 rounded-xl shadow-sm"
                                    />
                                    <Button type="submit" size="icon" disabled={!messageInput.trim()} className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20">
                                        <Send className={cn("h-5 w-5", isAr && "rotate-180")} />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                <MessageCircle className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{t("messages.selectChat")}</h3>
                            <p className="max-w-sm text-sm md:text-base leading-relaxed">
                                {t("messages.selectChatDesc")}
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default MessagesPage;
