import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomField } from '../../types/CustomField';
import { useConfigStore } from '../../store/configStore';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
    name: z.string().min(2, "Field name must be at least 2 characters"),
    type: z.string().nonempty("Field type is required"),
    required: z.boolean().optional(),
    options: z.string().optional(),
    placeholder: z.string().optional(),
})

export type FormValues = z.infer<typeof schema>;

const fieldTypeColors: Record<CustomField['type'], string> = {
    text: 'bg-blue-50 text-blue-700 border-blue-200 capitalize',
    number: 'bg-emerald-50 text-emerald-700 border-emerald-200 capitalize',
    date: 'bg-purple-50 text-purple-700 border-purple-200 capitalize',
    dropdown: 'bg-amber-50 text-amber-700 border-amber-200 capitalize',
    email: 'bg-cyan-50 text-cyan-700 border-cyan-200 capitalize',
    phone: 'bg-pink-50 text-pink-700 border-pink-200 capitalize',
    url: 'bg-indigo-50 text-indigo-700 border-indigo-200 capitalize',
    textarea: 'bg-orange-50 text-orange-700 border-orange-200 capitalize',
    checkbox: 'bg-gray-50 text-gray-700 border-gray-200 capitalize',
};

export const ContactCustomFields = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editField, setEditField] = useState<string | null>(null);
    const { toast } = useToast();

    const { loading, createCustomField, editCustomField, deleteCustomField, loadCustomFields, customFields } = useConfigStore();

    useEffect(() => {
        loadCustomFields();
    }, [loadCustomFields]);

    const allFields = [
        { name: "ContactName", type: "text", required: true, description: "", example: "", key: "contact_name", placeholder: "Fullname", isDefault: true },
        { name: "Email", type: "email", required: true, description: "", example: "", key: "contact_mailid", placeholder: "Ex. email@company.com", isDefault: true },
        { name: "PhoneNumber", type: "phone", required: false, description: "", example: "", key: "contact_phone", placeholder: "Ex. +91 1234567890", isDefault: true },
        { name: "OrganisationName", type: "text", required: true, description: "", example: "", key: "contact_organisation", placeholder: "Organisation Name", isDefault: true },
        { name: "Designation", type: "text", required: false, description: "", example: "", key: "designation", placeholder: "Enter Designation", isDefault: true },
        { name: "Tags", type: "dropdown", required: false, description: "", example: "", key: "tags", placeholder: "Select Tags", isDefault: true },
        { name: "Consent", type: "checkbox", required: false, description: "", example: "", key: "consent", placeholder: "Consent", isDefault: true },
        ...customFields
    ]

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            type: '',
            placeholder: '',
            required: false,
            options: ''
        }
    })

    const openEdit = (field: CustomField) => {
        form.setValue("name", field.name);
        form.setValue("type", field.type);
        form.setValue("placeholder", field.placeholder);
        form.setValue("required", field.required);
        form.setValue("options", field.options?.join(", "));
        setEditField(field.name);
        setDialogOpen(true);
    };

    const toggleRequired = async (field: CustomField, required: boolean) => {
        const success = await editCustomField({
            key: field.name, updates: {
                required
            }
        });
        if (success) {
            toast({ title: "Success", description: "Field required status changed!" })
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditField(null);
        form.reset();
    }

    const handleSubmit = async (values: FormValues) => {
        let options: string[] = [];
        let success: boolean = false;
        if (values.options) {
            options = values.options.split(",");
        }
        if (editField) {
            const payload = {
                key: editField,
                updates: {
                    ...values,
                    options,
                }
            }
            success = await editCustomField(payload)
        } else {
            const payload = {
                ...values,
                options
            }
            success = await createCustomField(payload)
        }

        if (success) {
            form.reset();
            setDialogOpen(false);
        }
    }

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings2 size={24} />
                        Contact Fields
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage the fields that appear on contact forms and records.
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                    <Plus size={16} />
                    Add Field
                </Button>
            </div>

            {/* Fields list */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_80px_100px_80px] gap-4 px-6 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>Field Name</span>
                    <span>Type</span>
                    <span>Required</span>
                    <span>Source</span>
                    <span>Actions</span>
                </div>

                {allFields.map((field, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-[1fr_120px_80px_100px_80px] gap-4 px-6 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <GripVertical size={14} className="text-gray-300" />
                            <span className="font-medium text-gray-900">{field.name}</span>
                            {field.placeholder && (
                                <span className="text-xs text-gray-400 truncate max-w-[200px]">"{field.placeholder}"</span>
                            )}
                        </div>
                        <Badge variant="outline" className={fieldTypeColors[field.type]}>
                            {field.type === "text" ? "Single Line Text" : field.type === "textarea" ? "Multi Line Text" : field.type}
                        </Badge>
                        <div>
                            <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => toggleRequired(field, checked)}
                                disabled={field.isDefault || loading.editingCustomField}
                            />
                        </div>
                        <span className="text-xs text-gray-500">
                            {field.isDefault ? 'System' : 'Custom'}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(field)}>
                                <Pencil size={14} />
                            </Button>
                            {!field.isDefault &&
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteCustomField(field.name)}>
                                    <Trash2 size={14} />
                                </Button>
                            }
                        </div>
                    </div>
                ))}

                {loading.loadingCustomFields && (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading...
                    </div>
                )}

                {allFields.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No fields configured. Click "Add Field" to create your first field.
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editField ? 'Edit Field' : 'Add Custom Field'}</DialogTitle>
                        <DialogDescription>
                            {editField ? 'Update the field configuration.' : `Add a new field to contacts records.`}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                            <FormField control={form.control} name="name" rules={{ required: "Field name is required!" }} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Field Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g. Employee ID' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="type" rules={{ required: "Field type is required!" }} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Field Type *</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="dropdown">Dropdown</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="phone">Phone</SelectItem>
                                                <SelectItem value="url">URL</SelectItem>
                                                <SelectItem value="textarea">Textarea</SelectItem>
                                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            {form.watch("type") === 'dropdown' && (
                                <FormField control={form.control} name="options" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Options *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Option 1, Option 2, Option 3"
                                                rows={2}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                            <FormField control={form.control} name="placeholder" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Placeholder</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Hint text for the field" {...field} />
                                    </FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="required" render={({ field }) => (
                                <FormItem className='flex justify-between items-center'>
                                    <FormLabel>Required</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                                <Button disabled={loading.creatingCustomField || loading.editingCustomField}>{editField ? "Update Field" : "Add Field"}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};