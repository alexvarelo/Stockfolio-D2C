import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import type { Portfolio } from '@/api/portfolio/portfolio';

const portfolioFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  is_public: z.boolean().default(false),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

interface PortfolioDetailsFormProps {
  portfolio: Portfolio;
  onSave: (data: Partial<Portfolio>) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const PortfolioDetailsForm = ({ 
  portfolio, 
  onSave, 
  onCancel,
  className = '' 
}: PortfolioDetailsFormProps) => {
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      name: portfolio.name,
      description: portfolio.description || '',
      is_public: portfolio.is_public || false,
    },
  });

  const onSubmit = async (data: PortfolioFormValues) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error('Failed to update portfolio:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio Name</FormLabel>
              <FormControl>
                <Input placeholder="My Portfolio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your investment strategy..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>
                  {field.value ? 'Public Portfolio' : 'Private Portfolio'}
                </FormLabel>
                <FormDescription className="text-sm text-muted-foreground">
                  {field.value
                    ? 'Your portfolio is visible to other users.'
                    : 'Your portfolio is private and only visible to you.'}
                </FormDescription>
              </div>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {field.value ? 'Public' : 'Private'}
                  </span>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Toggle portfolio visibility"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
