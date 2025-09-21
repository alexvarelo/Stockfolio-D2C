import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface Follower {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
}

interface FollowersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  users: Follower[];
  emptyText?: string;
}

export const FollowersDrawer: React.FC<FollowersDrawerProps> = ({
  open,
  onOpenChange,
  title,
  users,
  emptyText = "No users found.",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md bg-background z-50 flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="divide-y divide-border overflow-y-auto flex-1">
          {users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{emptyText}</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 py-4 px-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.fullName || user.username}</div>
                  <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                </div>
                <Button size="sm" variant="secondary" className="shrink-0">View</Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
