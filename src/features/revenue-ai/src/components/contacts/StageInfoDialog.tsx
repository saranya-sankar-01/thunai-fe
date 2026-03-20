
import React, { useState } from 'react';
import { Calendar, DollarSign, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import z, { boolean } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { useOpportunityStore } from '../../store/opportunityStore';

interface StageInfoDialogProps {
  open: boolean;
  onOpenChange: (value: null) => void;
  stage: Record<string, string>;
}

const schema = z.object({
  deal_value: z.string().optional(),
  expected_close_date: z.string().optional(),
  timeframe: z.string().optional(),
  additional_notes: z.string().optional(),
  stage: z.string().optional(),
})

export type OpportunityStageFormValues = z.infer<typeof schema>;

export const StageInfoDialog = ({
  open,
  onOpenChange,
  stage,
}: StageInfoDialogProps) => {

  const { updateOpportunityStage, loading } = useOpportunityStore();

  const form = useForm<OpportunityStageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deal_value: "",
      expected_close_date: "",
      timeframe: "",
      additional_notes: "",
      stage: stage?.stage,
    }
  });

  const handleCloseDialog = () => {
    form.reset();
    onOpenChange(null);
  }

  const handleSubmit = async (values: OpportunityStageFormValues) => {
    if (stage?.opportunityId) {
      const success = await updateOpportunityStage(stage?.opportunityId, { ...values, stage: stage?.stage });
      if (success) {
        handleCloseDialog();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCloseDialog();
      }
    }}>
      <DialogContent className="sm:max-w-md" aria-describedby="">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stage?.stage} Stage
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField control={form.control} name="deal_value" render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Value (USD)</FormLabel>
                <FormControl className='relative'>
                  {/* <>
                    <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" /> */}
                  <Input type='number' placeholder="Enter deal value" {...field} />
                  {/* </> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField disabled={!!form.watch("timeframe")} control={form.control} name="expected_close_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Close Date</FormLabel>
                <FormControl className='relative'>
                  {/* <>
                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" /> */}
                  <Input type='date' placeholder="Enter deal value" {...field} />
                  {/* </> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="timeframe" render={({ field }) => (
              <FormItem>
                <FormLabel>Or Select Timeframe</FormLabel>
                <FormControl>
                  <Select disabled={!!form.watch('expected_close_date')} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="This Month">This Month</SelectItem>
                      <SelectItem value="Next Month">Next Month</SelectItem>
                      <SelectItem value="This Quarter">This Quarter</SelectItem>
                      <SelectItem value="Next Quarter">Next Quarter</SelectItem>
                      <SelectItem value="This Year">This Year</SelectItem>
                      <SelectItem value="Next Year">Next Year</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="additional_notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any relevant notes about this stage..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Confidence Preview */}
            {/* <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <MessageSquare size={14} className="text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Confidence Score: {calculateConfidenceScore(stage, !!value, !!closeDate || !!timeframe, !!notes)}%
                </span>
              </div>
            </div> */}

            <DialogFooter className="flex space-x-3 mt-6">
              <Button className="flex-1">
                Update Stage
              </Button>
              <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};