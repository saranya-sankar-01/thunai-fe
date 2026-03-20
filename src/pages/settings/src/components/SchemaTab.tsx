import React, { useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AttributesList from "../components/AttributesList";
import SchemaSkeleton from "../components/SchemaSkeleton";
import CreateEditAttributeDialog from "../components/CreateEditAttributeDialog";
import { useSchemaStore } from "../store/schemaStore";
import { Attribute } from "../types/Attribute";


const attributeSchema = z.object({
    attributes: z.array(
        z.object({
            attribute_name: z.string().min(1, "Attribute name is required").max(30, "Must be lessthan 30 characters"),
            attribute_type: z.string().min(1, "Attribute type is required")
        })
    )
});

export type FormValues = z.infer<typeof attributeSchema>

const SchemaTab: React.FC = () => {
    const [openAddAttribute, setOpenAddAttribute] = useState<boolean>(false);
    const [duplicate, setDuplicate] = useState<boolean>(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string|null>(null);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    
    const { loadAttributes, loadSchema, deleteAttribute, schema, attributes, loading } = useSchemaStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(attributeSchema),
        defaultValues: {
            attributes: [{
                attribute_name: "", attribute_type: ""
            }]
        }
    });

    useEffect(() => {
        loadAttributes();
        loadSchema();
    }, [loadAttributes, loadSchema]);

    const checkDuplicateAttribute = (value: string) => {
        setDuplicate(attributes.some(item => item.attribute_name === value))
    }

    const openEditAttribute = (value: Attribute) => {
        form.setValue(`attributes.${0}.attribute_name`, value.attribute_name)
        form.setValue(`attributes.${0}.attribute_type`, value.attribute_type)
        setEditId(value.id);
        setOpenAddAttribute(true);;
        checkDuplicateAttribute(value.attribute_name)
    };

    const handleOpenDelete = (id: string) => {
        setOpenDelete(true);
        setDeleteId(id);
    }

    const handleDeleteAttribute = () => {
        deleteAttribute(deleteId);
        setOpenDelete(false);
    }

    if (loading) return <SchemaSkeleton />

    return (
        <>
            <CreateEditAttributeDialog open={openAddAttribute} setOpen={setOpenAddAttribute} form={form} checkDuplicate={checkDuplicateAttribute} duplicate={duplicate} setEditId={setEditId} editId={editId} />
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="max-w-2xl" aria-describedby="">
                    <DialogHeader>
                        <DialogTitle>Manage Attribute</DialogTitle>
                        <DialogDescription>Are you sure you want to delete the Attribute?</DialogDescription>
                    </DialogHeader>
                    <div className='flex space-x-3 justify-end'>
                        <Button variant='secondary' disabled={loading} onClick={() => setOpenDelete(false)}>No</Button>
                        <Button disabled={loading} onClick={handleDeleteAttribute}>Yes</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="my-4">
                <div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                        <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full self-start sm:self-auto">
                            Version {schema.version}
                        </span>
                        <Button onClick={() => setOpenAddAttribute(true)}>+ Add Attributes</Button>
                    </div>
                </div>
            </div>
            <div className="block h-[calc(100vh-320px)] overflow-y-auto gap-6 lg:grid lg:grid-cols-2 md:overflow-y-hide md:h-full sm:gap-8">
                <AttributesList title="All Attributes" attributes={attributes} openEdit={openEditAttribute} onOpenDelete={handleOpenDelete} />
                <AttributesList title="Selected Attributes" attributes={schema.attribute_mapping} />
            </div>
        </>
    )
}

export default SchemaTab