import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, UserPlus } from 'lucide-react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import MultiSelect from '../ui/multi-select';
import { useContactStore } from '../../store/contactStore';
import { Checkbox } from '../ui/checkbox';
import { Contact } from '../../types/Contact';
import { useUserManagementStore } from '../../store/userManagementStore';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '../ui/textarea';
import { CustomField } from '../../types/CustomField';
import { useConfigStore } from '../../store/configStore';
import { formatLabel } from '../../lib/utils';

const tags: string[] = ["VIP", "Enterprise", "Hot Lead", "Decision Maker", "Technical", "Follow-up"];

const schema = z.object({
  contact_name: z.string().min(1, "Name is required"),
  contact_mailid: z.string().email("Invalid email"),
  phone: z.string().optional(),
  contact_organisation: z.string().min(1, "Organisation is required"),
  designation: z.string().min(1, "Designation is required"),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must accept the privacy policy",
  }),
}).passthrough();

export type ContactFormValues = z.infer<typeof schema>;

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
            onCheckedChange={(checked) => field.onChange(checked)}
          />
          <FormLabel htmlFor={customField.name}>{customField.placeholder}</FormLabel>
        </div>
      );

    default:
      return <Input type="text" placeholder={customField.placeholder} {...field} />;
  }
};

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: "add" | "edit" | null) => void;
  editContact?: Contact;
}

export const AddContactDialog = ({ open, onOpenChange, editContact }: AddContactDialogProps) => {
  const { users, loading: loadingUsers, loadUsers } = useUserManagementStore();
  const { createContact, updateContact, loading } = useContactStore();
  const { loadCustomFields, customFields } = useConfigStore();
  // const [form, setForm] = useState({
  //   name: '', email: '', phone: '', company: '', role: '', assignedTo: ''
  // });

  // console.log(editContact)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_name: '',
      contact_mailid: '',
      phone: '',
      contact_organisation: '',
      designation: '',
      assignee: '',
      tags: [],
      consent: false,
    },
  });

  useEffect(() => {
    loadUsers();
    loadCustomFields();
  }, [loadUsers, loadCustomFields]);

  useEffect(() => {
    if (!open || !editContact) return;

    const values: Record<string, any> = {
      contact_name: editContact.name,
      contact_mailid: editContact.email,
      phone: editContact.phone,
      contact_organisation: editContact.organisation,
      designation: editContact.designation,
      tags: editContact.tags,
      assignee: editContact.assignee?.assignee_user_id,
      consent: editContact.consent,
    };

    if (editContact.custom_fields) {
      Object.entries(editContact.custom_fields).forEach(
        ([key, value]) => {
          values[key] = value;
        }
      );
    }

    form.reset(values);

  }, [open, editContact, customFields]);


  const handleCloseDialog = () => {
    onOpenChange(null);
    form.reset();
  }

  // console.log(customFields)

  const handleSubmit = async (values: ContactFormValues) => {
    let success: boolean = false;
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
        if (key === "assignee") normalFields["assignee_user_id"] = value;
        else normalFields[key] = value;
      }
    })

    const payload = {
      ...normalFields,
      custom_fields,
      contact_id: editContact?.id
    }

    console.log(payload);

    if (editContact?.id) {
      // const payload = { ...values, assignee_user_id: values.assignee, contact_id: editContact?.id }
      success = await updateContact(payload);
    } else {
      success = await createContact(payload);
    }

    if (success) {
      handleCloseDialog();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-md" aria-describedby="">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Add New Contact
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField control={form.control} name="contact_name" rules={{ required: "Username is required!" }} render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Fullname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contact_mailid" rules={{ required: "Email is required!" }} render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex. email@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="123-456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contact_organisation" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Organisation Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="designation" render={({ field }) => (
              <FormItem>
                <FormLabel>Designation *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Designation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Select Group from the list</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={tags}
                    selectedValues={field.value || []}
                    onSelectionChange={field.onChange}
                    placeholder="Select Tags"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="assignee" render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Assignee" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {!users.length && !loadingUsers.usersLoading ? (<SelectGroup><SelectLabel>No Users Found!</SelectLabel></SelectGroup>) :
                        (users.map(user => (
                          <SelectItem key={user.id} value={user.user_id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        )))
                      }
                    </SelectContent>
                  </Select>
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

            {/* {!editContact?.id && */}
            <FormField control={form.control} name="consent" render={({ field }) => (
              <FormItem>
                <FormControl className='mr-2'>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>I confirm that I have obtained this person’s consent in accordance with &nbsp;
                  <a
                    href="https://www.thunai.ai/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Thunai’s Privacy Policy </a>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )} />
            {/* } */}

            <DialogFooter>
              <Button type="button" variant="outline" disabled={loading.contactCreating || loading.contactUpdating} onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" disabled={!form.watch("consent") || loading.contactCreating || loading.contactUpdating}>{editContact?.id ? "Edit Contact" : "Add Contact"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
