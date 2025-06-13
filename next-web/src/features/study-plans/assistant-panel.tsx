"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}
export const AssistantPanel: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  return (
    <div
      className={cn("shadow-md rounded-lg relative overflow-hidden h-full", {
        "hidden opacity-0": !isOpen,
      })}
    >
      <div className="flex p-1 w-full items-center justify-between bg-neutral-100 rounded-t-xl">
        <p className="font-medium">Assistant Panel</p>
        <Button onClick={() => setIsOpen(false)} variant="secondary" size="sm">
          <X size={18} className="z-10" />
        </Button>
      </div>

      <div className="flex gap-2 w-full absolute bottom-0 p-2">
        <Input className="w-full" />
        <Button>
          <Send />
        </Button>
      </div>
    </div>
  );
};
