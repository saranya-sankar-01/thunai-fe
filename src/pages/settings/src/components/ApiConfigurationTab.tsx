import React, { useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from '@hookform/resolvers/zod';

import ConfigurationCreateEditDialog from '../components/ConfigurationCreateEditDialog';
import ConfigurationButton from '../components/ConfigurationButton';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import ConfigurationApiView from '../components/ConfigurationApiView';
import { useConfigurationStore } from '../store/configurationStore';
import { ApiKeyItem } from '../types/ApiKeyItem';

import DocumentationImage from "../assets/images/documentation.svg";
import Edit from "../assets/images/edit-blue.svg";
import Delete from "../assets/images/dustbin.svg";
import ConfigurationDate from './ConfigurationDate';

const schema = z.object({
    key_name: z.string().min(2, "Key name is required!"),
    validity: z.number().nullable(),
    indefiniteValidity: z.boolean().optional()
}).refine(data => data.indefiniteValidity || (data.validity !== null && data.validity > 0), {
    message: "Validity is required!",
    path: ["validity"]
});

export type FormValues = z.infer<typeof schema>;

const ApiConfigurationTab: React.FC = () => {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [editId, setEditId] = useState<string>(null);
    const [deleteId, setDeleteId] = useState<string>(null);
    const [viewKey, setViewKey] = useState<Record<string, boolean>>({
        accessKey: true,
        accessSecret: true
    })
    const tenantId = localStorage.getItem("tenant_id");

    const { loading, loadApiKey, apiKeys, deleteApiKey } = useConfigurationStore();

    const openEdit = (apiKey: ApiKeyItem) => {
        form.setValue("key_name", apiKey.key_name);
        form.setValue("validity", +apiKey.valid_days);
        form.setValue("indefiniteValidity", apiKey.valid_days === null && apiKey.validity === "NA" ? true : false)
        setOpenDialog(true);
        setEditId(apiKey.id)
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { key_name: "", validity: null, indefiniteValidity: false }
    })



    const handleDeleteApiKey = (id: string) => {
        deleteApiKey(id);
        setDeleteId(null);
    }

    useEffect(() => {
        loadApiKey()
    }, [loadApiKey]);

    return (
        <>
            <DeleteConfirmationDialog
                title="Delete API Key"
                description="Are you sure you want to delete this API key? This action cannot be undone."
                keyword="delete"
                buttonText="Delete"
                loading={loading}
                openDeleteDialog={!!deleteId}
                handleCloseModal={() => setDeleteId(null)}
                handleDelete={() => handleDeleteApiKey(deleteId)}
            />
            <div className="flex flex-row justify-between items-center bg-gray-50 p-4 m-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col space-y-1 min-w-0">
                    <span className="text-lg font-font-medium text-gray-800 md:text-xl md:font-medium">API Keys</span>
                    <span className="text-xs text-gray-500 md:text-sm">Maximum 2 Keys allowed</span>
                    <a
                        className="cursor-pointer flex flex-row text-blue-600 text-sm whitespace-nowrap lg:text-base hover:underline"
                        href="https://api-docs.thunai.ai/"
                        target="_blank"
                    >
                        <img src={DocumentationImage} alt="API Documentation" className="w-4" />
                        API Documentation
                    </a>
                </div>
                <button className='bg-primary text-white px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm rounded-lg shadow-md -700 transition duration-200 transform focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-primaryHover' onClick={() => setOpenDialog(true)}>Generate New Key</button>
                <ConfigurationCreateEditDialog editId={editId} openDialog={openDialog} setEditId={setEditId} setOpenDialog={setOpenDialog} form={form} />
            </div>
            {loading ? <div className="w-full h-80 bg-gray-200 rounded-xl animate-pulse" /> :
                <>
                    {apiKeys.map(apiKey => (
                        <div className="p-6 border m-6 border-gray-300 rounded-xl bg-white mb-6 shadow-xl min-w-0" key={apiKey.id}>
                            <div className="flex flex-col gap-2 justify-between items-center mb-6 md:flex-row">
                                <h5 className="text-xl font-medium text-gray-800">{apiKey.key_name}</h5>
                                <div className="flex space-x-6">
                                    <ConfigurationButton source={Edit} action="Edit" onClick={() => openEdit(apiKey)} />
                                    <ConfigurationButton source={Delete} action="Delete" onClick={() => setDeleteId(apiKey.id)} />
                                </div>
                            </div>
                            <div className="mb-6 space-y-6">
                                <div className="flex flex-col space-y-2">
                                    <h6 className="font-medium text-gray-800 text-sm">Access Key:</h6>
                                    <ConfigurationApiView apiValue={apiKey.access_key} viewKey={viewKey.accessKey} field="accessKey" setViewKey={setViewKey} />
                                    <h6 className="font-medium text-gray-800 text-sm">Access Secret:</h6>
                                    <ConfigurationApiView apiValue={apiKey.access_secret} viewKey={viewKey.accessSecret} field="accessSecret" setViewKey={setViewKey} />
                                    <h6 className="font-medium text-gray-800 text-sm">Tenant ID:</h6>
                                    <ConfigurationApiView apiValue={tenantId} field="tenantId" />
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <ConfigurationDate title="Created On" date={apiKey.created} />
                                <ConfigurationDate title="Valid Till" date={apiKey.validity === "NA" ? "Indefinite" : apiKey.validity} />
                            </div>
                        </div>
                    ))}
                </>
            }
        </>
    )
}

export default ApiConfigurationTab