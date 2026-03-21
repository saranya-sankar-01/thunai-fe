import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import SsoConfigurationsList from "../components/SsoConfigurationsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSsoStore } from "../store/ssoStore";
import { ssoOptions } from "../lib/utils";
import CreateEditSso from "./CreateEditSso";

const SsoTab: React.FC = () => {
    const [openConfigDialog, setOpenConfigDialog] = useState<boolean>(false);
    const [viewSsoForm, setViewSsoForm] = useState<boolean>(false);
    const {
        loadSsoConfigurations,
        isEdit,
        setIsEdit,
        appID,
        setAppID,
        selectedSso,
        setSelectedSso
    } = useSsoStore();
    const sso_auth = ssoOptions[0].value;

    useEffect(() => {
        loadSsoConfigurations()
    }, [loadSsoConfigurations]);

    const handleViewSsoForm = () => {
        setOpenConfigDialog(false);
        setIsEdit(false);
        setAppID('');
        setSelectedSso(sso_auth);
        setViewSsoForm(true);
    }

    const handleBack = () => {
        setViewSsoForm(false);
        setIsEdit(false);
        setAppID('');
        setSelectedSso('');
        loadSsoConfigurations();
    };

    return (
        <>
            <Dialog open={openConfigDialog} onOpenChange={setOpenConfigDialog}>
                <DialogContent className="max-w-2xl" aria-describedby="">
                    <DialogHeader>
                        <DialogTitle>Create New Configuration</DialogTitle>
                    </DialogHeader>
                    <hr />
                    <div className="p-2">
                        {ssoOptions.map(option => (
                            <div className="flex items-start my-2" key={option.value}>
                                <input type="radio" className="h-5 w-5 mt-1 static" checked={sso_auth === option.value} id={option.value} onChange={(e) => { }} />
                                <div className="mx-2">
                                    <label htmlFor={option.value} className="text-md text-[#161616] font-bold inline-block">
                                        {option.label}
                                    </label>
                                    <p>{option.description}</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end gap-4 mt-6">
                            <Button onClick={handleViewSsoForm}>Next</Button>
                            <Button variant="outline" onClick={() => setOpenConfigDialog(false)}>Cancel</Button>
                        </div>
                    </div>
                </DialogContent >
            </Dialog >
            {viewSsoForm || isEdit ? (
                <CreateEditSso
                    onBack={handleBack}
                    ssoType={selectedSso || 'SAML'}
                    appID={appID}
                />
            ) : (
                <>
                    <div className="py-2 flex justify-between">
                        <div className="flex flex-col">
                            <p className="text-lg font-medium">Integrations</p>
                            <p className="text-sm text-[#667085]">
                                Single Sign-On provider that enables users to authenticate
                            </p>
                        </div>
                        <Button onClick={() => setOpenConfigDialog(true)}>Add Config</Button>
                    </div>
                    <div>
                        <SsoConfigurationsList />
                    </div>
                </>
            )}
        </>
    );
}

export default SsoTab;