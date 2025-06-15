"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, Copy, RotateCcw, Send, X } from "lucide-react";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const AssistantPanel: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your question. Let me help you with that...",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-card/40  shadow-lg rounded-lg flex flex-col relative overflow-hidden h-full transition-all duration-200",
        {
          "hidden opacity-0 pointer-events-none": !isOpen,
        },
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-4 border-b bg-white dark:bg-accent rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              AI Assistant
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-200">
              {messages.length > 0 ? `${messages.length} messages` : "Ready"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              onClick={clearConversation}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Clear conversation"
            >
              <RotateCcw size={14} />
            </Button>
          )}
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="pb-4 h-full flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
              <Bot size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              How can I help you today?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-300 max-w-sm">
              Ask me anything - I&apos;m here to assist with questions, provide
              explanations, help with tasks, and more.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="group">
                {msg.isUser ? (
                  // User message - right aligned with background
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-gray-100 dark:bg-card rounded-xl px-4 py-3">
                      <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  // AI message - left aligned, no background
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <Button
                          onClick={() => copyToClipboard(msg.content)}
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2 opacity-50 group-hover:opacity-100 text-xs text-gray-700 dark:text-gray-200  transition-opacity"
                        >
                          <Copy size={12} className="mr-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="absolute bg-card dark:bg-accent bottom-0 w-full z-50 p-3">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[52px] max-h-32 resize-none border-none shadow-none  focus:ring-primary  rounded-xl focus-visible:ring-0 focus:border-none"
            placeholder="Message AI Assistant..."
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            size="sm"
            className="absolute bottom-2 right-2 h-8 w-8 p-0"
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
