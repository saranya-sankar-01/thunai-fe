import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSsoStore } from "../store/ssoStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { requestApi, SERVICE_BASE_URLS } from '@/services/authService';
import { ArrowLeft, Copy, Upload, Trash2, Info } from "lucide-react";

interface CreateEditSsoProps {
    onBack: () => void;
    ssoType?: string;
    appID?: string;
}

const CreateEditSso: React.FC<CreateEditSsoProps> = ({ onBack, ssoType = 'SAML', appID = '' }) => {
    const { toast } = useToast();
    const { saveSamlConfiguration, fetchSamlConfiguration, verifySamlMetadata, isEdit, setIsEdit, loading } = useSsoStore();

    // const [step, setStep] = useState(isEdit ? 2 : 1);
    // const [loading, setLoading] = useState<any>({ savesso: false, xmlLink: false });
    const [sso_logo, setSsoLogo] = useState<string>('');
    const [fileData, setFileData] = useState<File | null>(null);
    const [metaDataOption, setMetaDataOption] = useState<string>('LOCAL');
    const [showMetaDataXml, setShowMetaDataXml] = useState<boolean>(!isEdit);
    const [isCancel, setIsCancel] = useState<boolean>(false);
    const [verifyStatus, setVerifyStatus] = useState<string>('');
    const [entityIdMeta, setEntityIdMeta] = useState<string>('');
    const [metaFileData, setMetaFileData] = useState<File | null>(null);
    const [samlDiscovery, setSamlDiscovery] = useState({
        signInUrl: '',
        signOutUrl: '',
        callBackUrl: '',
        appLoginUrl: '',
        sp_meta_data: '',
        entityIDUrl: '',
        samlACSUrl: ''
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
        defaultValues: {
            sso_provider_name_saml: '',
            sso_provider_logo_saml: '',
            sso_redirect_id_saml: '',
            sso_logout_redirect_id_saml: '',
            remote_metadata_url: '',
            entityID: '',
            signingKey: '',
            encryptionKey: '',
            validUntil: '',
            singleSignOnBinding: '',
            singleSignOnUrl: '',
            singleLogoutService: '',
            logoutUrl: '',
            wantAssertionSigned: false,
            enable_impersonation: false,
        }
    });

    useEffect(() => {
        if (isEdit && appID) {
            const handleGetSaml = async () => {
                const res: any = await fetchSamlConfiguration(appID);
                console.log(res);
                if (res.status === 'success') {
                    const data = res.data;
                    setSsoLogo(data.provider_logo);
                    setEntityIdMeta(data.idp_details?.entity_id || '');
                    reset({
                        sso_provider_name_saml: data.provider_name,
                        sso_provider_logo_saml: data.provider_logo,
                        sso_redirect_id_saml: data.redirect_uri,
                        sso_logout_redirect_id_saml: data.logout_redirect_uri,
                        enable_impersonation: data.enable_impersonation,
                    });
                }
            }
            handleGetSaml();
        }
        updateSamlDiscoveryUrls(appID);
    }, [isEdit, appID]);

    const updateSamlDiscoveryUrls = (id: string) => {
        const baseUrl = SERVICE_BASE_URLS.samlService;
        const urlIdentifier = userInfo.url_identifier || userInfo.urlidentifier;
        setSamlDiscovery({
            signInUrl: `${baseUrl}saml/${urlIdentifier}/login/${id}/`,
            signOutUrl: `${baseUrl}saml/${urlIdentifier}/logout/${id}/`,
            callBackUrl: `${baseUrl}saml/${urlIdentifier}/oidc/${id}/callback/`,
            appLoginUrl: `${baseUrl}saml/${urlIdentifier}/oidc/${id}/start/`,
            sp_meta_data: `${baseUrl}saml/${urlIdentifier}/metadata/${id}/`,
            entityIDUrl: `${baseUrl}saml/${urlIdentifier}/metadata/${id}/`,
            samlACSUrl: `${baseUrl}saml/${urlIdentifier}/acs/${id}/`
        });
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        const url = `${userInfo.default_tenant_id}/file/upload/`;

        try {
            const res: any = await requestApi('POST', url, formData, 'documentService');
            if (res?.data?.url) {
                setSsoLogo(res.data.url);
                setValue('sso_provider_logo_saml', res.data.url);
                setFileData(file);
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
        }
    };

    const removeImgLogo = () => {
        setSsoLogo('');
        setValue('sso_provider_logo_saml', '');
        setFileData(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMetaFileData(file);
            setEntityIdMeta('uploaded-file');
        }
    };

    const removeLogo = () => {
        setMetaFileData(null);
    };

    const xmlTypeChange = (type: string) => {
        setMetaDataOption(type);
        setVerifyStatus('');
    };

    const verifyXml = async () => {
        const formData = new FormData();
        const formValues = watch();
        if (metaDataOption === 'CUSTOM') {
            formData.append('xmltype', 'custom');
            formData.append('encryptionKey', formValues.encryptionKey);
            formData.append('SingleLogoutService', formValues.singleLogoutService);
            formData.append('logoutUrl', formValues.logoutUrl);
            formData.append('SingleSignOnBinding', formValues.singleSignOnBinding);
            formData.append('SingleSignOnUrl', formValues.singleSignOnUrl);
            formData.append('validUntil', formValues.validUntil);
            formData.append('entityID', formValues.entityID);
        } else {
            formData.append('xmlpath', formValues.remote_metadata_url);
            formData.append('xmltype', 'link');
        }
        const res: any = await verifySamlMetadata(formData);
        if (res.status === 'success') {
            setVerifyStatus('Verified');
            setEntityIdMeta(res?.data?.entity_id);
            toast({ description: "Verified successfully" });
        }
    };

    const handleSaveSSO = async (data: any) => {
        const formData = new FormData();
        formData.append('provider_logo', sso_logo || '');
        formData.append('redirect_uri', data.sso_redirect_id_saml);
        formData.append('provider_name', data.sso_provider_name_saml);
        formData.append('logout_redirect_uri', data.sso_logout_redirect_id_saml || '');

        if (isEdit) {
            formData.append('id', appID);
            formData.append('type', metaDataOption.toLowerCase() === 'remote' ? 'link' : (metaDataOption.toLowerCase() === 'local' ? 'file' : 'custom'));
            if (metaDataOption === 'LOCAL') {
                if (metaFileData) formData.append('xmlfile', metaFileData);
            } else if (metaDataOption === 'REMOTE') {
                formData.append('xmllink', data.remote_metadata_url);
            } else if (metaDataOption === 'CUSTOM') {
                formData.append('encryptionKey', data.encryptionKey);
                formData.append('SingleLogoutService', data.singleLogoutService);
                formData.append('logoutUrl', data.logoutUrl);
                formData.append('SingleSignOnBinding', data.singleSignOnBinding);
                formData.append('SingleSignOnUrl', data.singleSignOnUrl);
                formData.append('validUntil', data.validUntil);
                formData.append('entityID', data.entityID);
                formData.append('signingKey', data.signingKey);
                formData.append('WantAssertionsSigned', data.wantAssertionSigned);
            }
        }
        const res: any = await saveSamlConfiguration(formData);

        if (res.status === 'success') {
            if (!isEdit) {
                const newId = res.data.id;
                setIsEdit(true);
                updateSamlDiscoveryUrls(newId);
            } else {
                toast({ description: "Saved successfully" });
                onBack();
            }
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ description: "Copied to clipboard" });
    };

    const isStep1Valid = () => {
        const name = watch('sso_provider_name_saml');
        const redirect = watch('sso_redirect_id_saml');
        return name && redirect;
    };

    const isStep2Valid = () => {
        const entityId = watch('entityID');
        const signingKey = watch('signingKey');
        const singleSignOnBinding = watch('singleSignOnBinding');
        const singleSignOnUrl = watch('singleSignOnUrl');
        const xmllink = watch("remote_metadata_url");
        return xmllink || (entityId && signingKey && singleSignOnBinding && singleSignOnUrl);
    };

    if (loading.fetchSso) return <div className="flex justify-center items-center h-48">
        <div className="w-8 h-8 mr-2 rounded-full animate-spin border-2 border-solid border-blue-500 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Fetching Provider Details...</span>
    </div>

    return (
        <div className="flex flex-col h-full">
            <Button variant="ghost" onClick={onBack} className="w-fit my-2">
                <ArrowLeft className="h-5 w-5" />
                Back
            </Button>

            <div className="h-[calc(100vh-200px)] overflow-y-auto flex gap-4 pr-2">
                <div className="border rounded-lg h-fit p-4 w-3/4 bg-white shadow-sm transition-all duration-300">
                    <form onSubmit={handleSubmit(handleSaveSSO)} className="space-y-6">
                        {/* {step === 1 && ( */}
                        <>
                            <div className="flex flex-col space-y-2">
                                <Label className="text-[#344054] text-sm">
                                    SSO Provider <span className="text-orange-500">*</span>
                                </Label>
                                <Input
                                    {...register("sso_provider_name_saml", { required: true })}
                                    placeholder="Enter Identity Provider Name"
                                    className="h-11"
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <Label className="text-[#344054] text-sm">Logo</Label>
                                <div className="flex items-center space-x-4">
                                    {sso_logo && (
                                        <div className="relative group">
                                            <div className="rounded-full w-14 h-14 border p-1 overflow-hidden bg-gray-50 flex items-center justify-center">
                                                <img src={sso_logo} className="w-full h-full object-cover rounded-full" alt="SSO logo" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeImgLogo}
                                                className="absolute -top-1 -right-1 bg-white rounded-full p-1 border shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                    <label className="flex items-center justify-center bg-[#ebf0ff] py-2 px-6 text-[#204bc6] rounded cursor-pointer border border-dashed border-[#204bc6]/30 hover:bg-[#ebf0ff]/80 transition-all flex-1">
                                        <Upload className="h-4 w-4 mr-2" />
                                        <span className="text-sm font-medium">{fileData ? fileData.name : 'Upload'}</span>
                                        <input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={handleLogoChange} />
                                    </label>
                                </div>
                                <span className="text-xs text-gray-400 font-light">* Only jpg, jpeg and png type file is accepted</span>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-1">
                                    <Label className="text-[#344054] text-sm">Redirect URL</Label>
                                    <span className="text-orange-500">*</span>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                </div>
                                <Input
                                    {...register("sso_redirect_id_saml", { required: true })}
                                    placeholder="Ex. https://www.google.com"
                                    className="h-11"
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-1">
                                    <Label className="text-[#344054] text-sm">Logout Redirect URL</Label>
                                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                </div>
                                <Input
                                    {...register("sso_logout_redirect_id_saml")}
                                    placeholder="Ex. https://www.google.com"
                                    className="h-11"
                                />
                            </div>
                        </>
                        {/* )} */}

                        {isEdit && (
                            <div className="space-y-6">
                                {showMetaDataXml ? (
                                    <div className="space-y-4">
                                        <p className="text-[#161616] font-medium text-sm">Upload Metadata XML <span className="text-orange-500">*</span></p>

                                        {/* LOCAL OPTION */}
                                        <div className={cn(
                                            "p-4 border rounded-lg transition-all cursor-pointer",
                                            metaDataOption === 'LOCAL' ? "border-blue-500 bg-blue-50/10" : "border-gray-200"
                                        )} onClick={() => xmlTypeChange('LOCAL')}>
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                                    metaDataOption === 'LOCAL' ? "border-blue-600" : "border-gray-300"
                                                )}>
                                                    {metaDataOption === 'LOCAL' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Use XML file</span>
                                            </div>
                                            {metaDataOption === 'LOCAL' && (
                                                <div className="pl-8 space-y-3">
                                                    <label className="flex items-center justify-center bg-[#ebf0ff] py-2 px-6 text-[#204bc6] rounded cursor-pointer border border-dashed border-[#204bc6]/30 hover:bg-[#ebf0ff]/80 transition-all">
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        <span className="text-sm font-medium">{metaFileData ? metaFileData.name : 'Upload XML File'}</span>
                                                        <input type="file" className="hidden" accept=".xml" onChange={handleFileChange} />
                                                    </label>
                                                    {metaFileData && (
                                                        <Button variant="ghost" size="sm" onClick={removeLogo} className="text-red-500 hover:text-red-600 p-0 h-auto">
                                                            <Trash2 className="h-3 w-3 mr-1" /> Remove
                                                        </Button>
                                                    )}
                                                    <p className="text-[10px] text-gray-400">* Only xml type file is accepted</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* REMOTE OPTION */}
                                        <div className={cn(
                                            "p-4 border rounded-lg transition-all cursor-pointer",
                                            metaDataOption === 'REMOTE' ? "border-blue-500 bg-blue-50/10" : "border-gray-200"
                                        )} onClick={() => xmlTypeChange('REMOTE')}>
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                                    metaDataOption === 'REMOTE' ? "border-blue-600" : "border-gray-300"
                                                )}>
                                                    {metaDataOption === 'REMOTE' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Use XML Link</span>
                                            </div>
                                            {metaDataOption === 'REMOTE' && (
                                                <div className="pl-8 flex items-center space-x-2">
                                                    <Input
                                                        {...register("remote_metadata_url")}
                                                        placeholder="Enter the IDP metadata URL"
                                                        className="flex-1"
                                                    />
                                                    {/* <Button
                                                        type="button"
                                                        onClick={verifyXml}
                                                        disabled={loading.verifySso || !watch('remote_metadata_url')}
                                                        className={cn(
                                                            "h-10",
                                                            verifyStatus ? "bg-green-600 hover:bg-green-700" : "bg-[#002cac] hover:bg-[#1e46bc]"
                                                        )}
                                                    >
                                                        {loading.verifySso ? 'Loading...' : (verifyStatus || 'Verify')}
                                                    </Button> */}
                                                </div>
                                            )}
                                        </div>

                                        {/* CUSTOM OPTION */}
                                        <div className={cn(
                                            "p-4 border rounded-lg transition-all cursor-pointer",
                                            metaDataOption === 'CUSTOM' ? "border-blue-500 bg-blue-50/10" : "border-gray-200"
                                        )} onClick={() => xmlTypeChange('CUSTOM')}>
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                                    metaDataOption === 'CUSTOM' ? "border-blue-600" : "border-gray-300"
                                                )}>
                                                    {metaDataOption === 'CUSTOM' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Use Custom Data</span>
                                            </div>
                                            {metaDataOption === 'CUSTOM' && (
                                                <div className="pl-8 grid grid-cols-1 gap-4 pt-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-600">Entity ID <span className="text-orange-500">*</span></Label>
                                                        <Input {...register("entityID", { required: metaDataOption === 'CUSTOM' })} placeholder="Enter Entity ID" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-600">Signing Key <span className="text-orange-500">*</span></Label>
                                                        <Input {...register("signingKey", { required: metaDataOption === 'CUSTOM' })} placeholder="Enter Signing Key" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-600">Encryption Key</Label>
                                                        <textarea
                                                            {...register("encryptionKey")}
                                                            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            placeholder="Please enter your Encryption Key"
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-gray-600">Metadata Expiry Date</Label>
                                                            <Input type="date" {...register("validUntil")} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-gray-600">Single Sign-On Binding <span className="text-orange-500">*</span></Label>
                                                            <select
                                                                {...register("singleSignOnBinding", { required: metaDataOption === 'CUSTOM' })}
                                                                className="w-full border rounded-md p-2 text-sm h-10 focus:outline-none"
                                                            >
                                                                <option value="">Select Binding</option>
                                                                <option value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">HTTP-POST</option>
                                                                <option value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-REDIRECT">HTTP-REDIRECT</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-gray-600">Single Sign On Url <span className="text-orange-500">*</span></Label>
                                                        <Input {...register("singleSignOnUrl", { required: metaDataOption === 'CUSTOM' })} placeholder="Enter Single Sign On URL" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-gray-600">Single Logout Binding</Label>
                                                            <select
                                                                {...register("singleLogoutService")}
                                                                className="w-full border rounded-md p-2 text-sm h-10 focus:outline-none"
                                                            >
                                                                <option value="">Select Binding</option>
                                                                <option value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">HTTP-POST</option>
                                                                <option value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-REDIRECT">HTTP-REDIRECT</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-gray-600">Logout URI</Label>
                                                            <Input {...register("logoutUrl")} placeholder="Enter Logout URL" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pt-2">
                                                        <input type="checkbox" id="wantAssertionSigned" {...register("wantAssertionSigned")} className="w-4 h-4 rounded text-blue-600" />
                                                        <Label htmlFor="wantAssertionSigned" className="text-sm font-normal text-gray-700">Want Assertions Signed</Label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-2">
                                        <div className="flex flex-col space-y-2">
                                            <Label className="text-[#344054] text-sm">Entity ID <span className="text-orange-500">*</span></Label>
                                            <div className="flex items-center space-x-2">
                                                <Input readOnly value={entityIdMeta} className="bg-gray-50 flex-1 h-11" />
                                                <Button type="button" onClick={() => { setShowMetaDataXml(true); setIsCancel(true); }} className="bg-[#002cac] hover:bg-[#1e46bc] h-11 px-6">Edit</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end items-center space-x-3 pt-4 border-t mt-8">
                            {showMetaDataXml && isCancel && (
                                <Button type="button" variant="outline" onClick={() => setShowMetaDataXml(false)} className="h-10 px-6">Cancel</Button>
                            )}
                            <Button
                                type="submit"
                                disabled={loading.saveSso || (!isEdit && !isStep1Valid()) || (isEdit && !isStep2Valid())}
                                className={cn(
                                    "h-11 px-8 rounded-md transition-all font-medium",
                                    (!isEdit ? isStep1Valid() : true || isEdit && isStep2Valid())
                                        ? "bg-[#002cac] text-white hover:bg-[#1e46bc] shadow-md hover:shadow-lg"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                {loading.saveSso ? (
                                    <div className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Saving...</div>
                                ) : (
                                    <span className="flex items-center">
                                        {!isEdit ? 'Save & Continue' : 'Save'}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* SAML DISCOVERY SIDEBAR */}
                {ssoType === 'SAML' && isEdit && (
                    <div className="w-[30%] bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden self-start sticky top-0 transition-all duration-500 animate-in slide-in-from-right-4">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <p className="text-[#4e4e4e] font-semibold flex items-center">
                                <Info className="h-4 w-4 mr-2 text-blue-500" />
                                SAML Discovery
                            </p>
                        </div>
                        <div className="p-4 space-y-5">
                            {[
                                { label: 'Sign-in URL', value: samlDiscovery.signInUrl },
                                { label: 'Sign-out URL', value: samlDiscovery.signOutUrl },
                                { label: 'Entity ID', value: samlDiscovery.entityIDUrl },
                                { label: 'Assertion Consumer Service URL', value: samlDiscovery.samlACSUrl }
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-2 group">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</h4>
                                    <div
                                        onClick={() => copyToClipboard(item.value)}
                                        className="relative flex items-center justify-between p-3 rounded-lg bg-blue-50/30 border border-blue-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all active:scale-[0.98]"
                                    >
                                        <p className="text-[#204bc6] text-[11px] font-mono break-all leading-relaxed flex-1 pr-6">
                                            {item.value || 'Will be generated...'}
                                        </p>
                                        <Copy className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-600 transition-colors absolute right-3 top-3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 mt-2 bg-yellow-50/30 border-t border-yellow-100/50">
                            <p className="text-[10px] text-yellow-700 leading-normal italic">
                                * Use these details to configure your Identity Provider (IdP) for seamless integration.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateEditSso;