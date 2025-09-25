import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

const onboardingSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  full_name: z.string().min(1, "Full name is required"),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  avatar_url: z.string().url("Must be a valid URL").optional(),
});

type OnboardingFields = z.infer<typeof onboardingSchema>;

export function UserOnboardingWizard() {
  const { user, userProfile, refetchUserProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Check if user needs onboarding
  useEffect(() => {
    if (user) {
      // If userProfile is null or missing required fields, show onboarding
      const needsOnboarding = !userProfile;
      setOpen(needsOnboarding);
    }
  }, [user, userProfile]);

  const form = useForm<OnboardingFields>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: user?.user_metadata?.username || userProfile?.username || "",
      full_name: user?.user_metadata?.full_name || userProfile?.full_name || "",
      bio: userProfile?.bio || "",
      website: userProfile?.website || "",
      avatar_url:
        user?.user_metadata?.avatar_url || userProfile?.avatar_url || "",
    },
  });

  // Update form when user or userProfile changes
  useEffect(() => {
    if (user || userProfile) {
      form.reset({
        username: user?.user_metadata?.username || userProfile?.username || "",
        full_name:
          user?.user_metadata?.full_name || userProfile?.full_name || "",
        bio: userProfile?.bio || "",
        website: userProfile?.website || "",
        avatar_url:
          user?.user_metadata?.avatar_url || userProfile?.avatar_url || "",
      });
      setSelectedAvatar(
        user?.user_metadata?.avatar_url || userProfile?.avatar_url || null
      );
    }
  }, [user, userProfile, form]);

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setSelectedAvatar(url || null);
    form.setValue("avatar_url", url);
  };

  const onSubmit = async (data: OnboardingFields) => {
    if (!user) return;

    try {
      setLoading(true);

      // Insert new user profile into the database
      const { error } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email || "",
          username: data.username,
          full_name: data.full_name,
          bio: data.bio || null,
          website: data.website || null,
          avatar_url: selectedAvatar || data.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      // Refresh the user profile and close the dialog
      await refetchUserProfile();
      setOpen(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-2">
          <DialogTitle className="text-xl sm:text-2xl">Welcome to Stocky!</DialogTitle>
          <p className="text-sm sm:text-base text-muted-foreground">
            Complete your profile to get started
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 p-1 sm:p-0">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={selectedAvatar || ""} alt="Profile" />
                <AvatarFallback className="text-lg sm:text-xl">
                  {user?.email?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tell us about yourself..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/avatar.jpg"
                      {...field}
                      onChange={handleAvatarUrlChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-2 px-2 sm:static sm:mx-0 sm:px-0">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
