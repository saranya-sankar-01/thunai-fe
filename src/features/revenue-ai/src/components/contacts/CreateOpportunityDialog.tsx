import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useUserManagementStore } from '../../store/userManagementStore';
import { useOpportunityStore } from '../../store/opportunityStore';
import { Contact } from '../../types/Contact';
import { useOpportunityConfigStore } from '../../store/opportunityConfigStore';
import { CustomField } from '../../types/CustomField';
import { Checkbox } from '../ui/checkbox';
import { formatLabel } from '../../lib/utils';

const stages = [
  'Discovery',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed-won',
];

interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
};

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  opportunity_reason: z.string().optional(),
  money: z.string().min(1, "Value is required"),
  stage: z.string().min(1, "Stage is required"),
  expected_close_date: z.string().optional(),
  // assignedTo: z.string().optional(),
  source: z.string().optional()
}).passthrough();

export type OpportunityFormValues = z.infer<typeof schema>;

const renderCustomField = (
  customField: CustomField,
  field: any
) => {
  switch (customField.type) {
    case "text":
      return <Input type="text" placeholder={customField.placeholder} {...field} />;

    case "number":
      return <Input type="number" placeholder={customField.placeholder} {...field} />;

    case "email":
      return <Input type="email" placeholder={customField.placeholder} {...field} />;

    case "phone":
      return <Input type="tel" placeholder={customField.placeholder} {...field} />;

    case "url":
      return <Input type="url" placeholder={customField.placeholder} {...field} />;

    case "date":
      return <Input type="date" placeholder={customField.placeholder} {...field} />;

    case "textarea":
      return <Textarea placeholder={customField.placeholder} {...field} />;

    case "dropdown":
      return (
        <Select
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={customField.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {customField.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "checkbox":
      return (
        <div className="flex items-center justify-start gap-2">
          <Checkbox
            id={customField.name}
            checked={field.value || false}
            onChange={(checked) => field.onChange(checked)}
          />
          <Label htmlFor={customField.name}>{customField.placeholder}</Label>
        </div>
      );

    default:
      return <Input type="text" placeholder={customField.placeholder} {...field} />;
  }
};


export const CreateOpportunityDialog = ({ open, onOpenChange, contact }: CreateOpportunityDialogProps) => {
  const { createOpportunity, loading, loadOpportunity } = useOpportunityStore();
  const { loadFields, customFields } = useOpportunityConfigStore();

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      opportunity_reason: "",
      money: "",
      stage: "",
      expected_close_date: "",
      // assignedTo: "",
      source: ""
    },
  });

  const handleSubmit = async (values: OpportunityFormValues) => {
    const customFieldNames = customFields.map(f => f.name);
    const custom_fields: Record<string, any> = {};
    const normalFields: Record<string, any> = {};

    for (const field of customFields) {
      const value = values[field.name];

      if (field.required && (value === undefined || value === "" || value === null)) {
        form.setError(field.name as any, {
          type: "manual",
          message: `${field.name} is required`,
        });

        return;
      }
    }

    Object.entries(values).forEach(([key, value]) => {
      if (customFieldNames.includes(key)) {
        custom_fields[key] = value;
      } else {
        normalFields[key] = value;
      }
    });
    const payload = {
      opportunity: {
        ...normalFields,
        custom_fields,
      },
      email: contact.email,
    }

    console.log(payload, "PAYLOAD")

    const success = await createOpportunity(payload);
    if (success) {
      form.reset();
      onOpenChange(false);
      await loadOpportunity([{ key_name: "associated_contacts.email", operator: "==", key_value: contact.email }])
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp size={20} />
            Create Opportunity for {contact.name}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField control={form.control} name="title" rules={{ required: "Title is required!" }} render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="opportunity_reason" rules={{ required: "Description is required!" }} render={({ field }) => (
              <FormItem>
                <FormLabel>Reason *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Reason" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="money" rules={{ required: "Money is required!" }} render={({ field }) => (
                <FormItem>
                  <FormLabel>Value *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="stage" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            {/* <div className="grid grid-cols-2 gap-3"> */}
            <FormField control={form.control} name="expected_close_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Close Date</FormLabel>
                <FormControl>
                  <Input type="date" placeholder="Expected Close Date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* <FormField control={form.control} name="assignedTo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.user_id} value={user.user_id}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} /> */}
            {/* </div> */}
            <FormField control={form.control} name="source" render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Source" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {customFields.map(customField => (
              <FormField key={customField.name} control={form.control} name={customField.name} render={({ field }) => (
                <FormItem>
                  <FormLabel>{formatLabel(customField)}{customField.required && " *"}</FormLabel>
                  <FormControl>
                    {renderCustomField(customField, field)}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={loading.creatingOpportunity} onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button disabled={loading.creatingOpportunity}>{loading.creatingOpportunity ? 'Creating...' : 'Create Opportunity'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
