import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';
import { useActivityStatusStore } from '../../store/activityStatusStore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useManualActivityStore } from '../../store/manualActivityStore';
import { useOpportunityStore } from '../../store/opportunityStore';
import { useActivityStore } from '../../store/activityStore';

// const defaultActivityStatuses = [
//   'Connected', 'Voicemail', 'No Answer', 'Busy', 'Wrong Number', 'Left Message', 'Callback Requested', 'Not Interested'
// ];

const schema = z.object({
  type: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().min(1, "Notes is required"),
  participants: z.string().optional(),
  contact_email: z.string().optional(),
  opportunity_id: z.string().optional(),
});

export type ManualActivityFormValues = z.infer<typeof schema>;

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact_email: string;
  // activityStatuses?: string[];
}

export const AddActivityDialog: React.FC<AddActivityDialogProps> = ({ open, onOpenChange, contact_email }) => {
  const { activityStatus, loadActivityStatus, loading: activityStatusLoading } = useActivityStatusStore();
  const { createManualActivity, loading, loadManualActivities } = useManualActivityStore();
  const { loadActivities } = useActivityStore();
  const { getManualOpportunityForActivity, manualOpportunityForActivity, loading: loadingManualOpportunity } = useOpportunityStore();

  const form = useForm<ManualActivityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: '',
      status: '',
      title: '',
      notes: '',
      participants: "",
      contact_email: contact_email,
      opportunity_id: ""
    }
  })

  useEffect(() => {
    loadActivityStatus();

  }, [loadActivityStatus]);

  useEffect(() => {
    if (contact_email) {
      getManualOpportunityForActivity(contact_email);
    }
  }, [getManualOpportunityForActivity, contact_email]);

  const handleCloseDialog = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleSubmit = async (values: ManualActivityFormValues) => {
    console.log(values);
    // onOpenChange(false);
    const participantsArray = values.participants?.split(",").map(item => {
      const [name, email] = item.split(":");
      return {
        name: name?.trim(),
        email: email?.trim()
      }
    }) || [];

    const payload = {
      ...values,
      participants: participantsArray,
    }

    const success = await createManualActivity(payload);

    if (success) {
      handleCloseDialog();
      loadActivities([], contact_email);
      loadManualActivities();
    }

  };

  // console.log(manualOpportunityForActivity);

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-md" aria-describedby="">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity size={20} />
            Add Activity
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="status" rules={{ required: "Status is required!" }} render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {!activityStatusLoading.loadingActivityStatus && !activityStatus.length ? (<SelectGroup><SelectLabel>No Activity Status Found!</SelectLabel></SelectGroup>) :
                        activityStatus.map(status => (
                          <SelectItem key={status} value={status}>{status.at(0).toUpperCase() + status.slice(1)}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="title" rules={{ required: "Title is required!" }} render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Activity title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="participants" render={({ field }) => (
              <FormItem>
                <FormLabel>Participants</FormLabel>
                <FormControl>
                  <Input placeholder="Name:email, Name:email, ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {contact_email &&
              <FormField control={form.control} name="opportunity_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Opportunity</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select opportunity" />
                      </SelectTrigger>
                      <SelectContent>
                        {!loadingManualOpportunity.manualOpportunityForActivityLoading && !manualOpportunityForActivity.length ? (<SelectGroup><SelectLabel>No Opportunities Found!</SelectLabel></SelectGroup>) :
                          manualOpportunityForActivity.map(opportunity => (
                            <SelectItem key={opportunity.id} value={opportunity.id}>{opportunity.title}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            }
            <DialogFooter>
              <Button type="button" variant="outline" disabled={loading.creatingActivity} onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button disabled={loading.creatingActivity}>{loading.creatingActivity ? "Adding Activity..." : "Add Activity"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
