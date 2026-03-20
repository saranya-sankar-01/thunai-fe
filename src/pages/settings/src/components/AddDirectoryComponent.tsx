import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AzureBasicInformation from "../components/AzureBasicInformation";
import AwsCognitoBasicInformation from "../components/AwsCognitoBasicInformation";
import GoogleWorkspaceBasicInformation from "../components/GoogleWorkspaceBasicInformation";
import AuthBasicInformation from "../components/AuthBasicInformation";
import LdapBasicInformation from "../components/LdapBasicInformation";
import UserMapping from "../components/UserMapping";
import Policies from "../components/Policies";
import Schedular from "../components/Schedular";
import JobDetails from "../components/JobDetails";
import { useDirectoryTabStore } from "../store/directoryTabStore";
import { cn } from "@/lib/utils";

import VerifiedTick from "../assets/images/verified-tick.svg";

const AddDirectoryComponent: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Store
    const {
        selectedApp,
        selectedStep,
        steps,
        activeIntegrationApps,
        loading,
        loadActiveIntegrationApps,
        setSelectedApp,
        setSelectedStep,
        updateStepCompletion,
        resetWizard
    } = useDirectoryTabStore();

    const { fetchIntegrationDetails } = useDirectoryTabStore();

    // Initial Load & Query Params (Edit Mode)
    useEffect(() => {
        const init = async () => {
            await loadActiveIntegrationApps();

            const id = searchParams.get('id');
            const tenantId = searchParams.get('tenantId');
            const stepParam = searchParams.get('step');

            if (id && tenantId) {
                // Edit Mode
                const userInfoString = localStorage.getItem("userInfo");
                const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
                const urlIdentifier = userInfo.urlidentifier || "";

                const result = await fetchIntegrationDetails(id, urlIdentifier, tenantId);

                if (result?.status === "success" && result.data) {
                    const data = result.data;
                    const integrationType = data.integration?.integrationType;

                    const apps = useDirectoryTabStore.getState().activeIntegrationApps;
                    const matchedApp = apps.find(a => a.appName === integrationType);

                    if (matchedApp) {
                        const filledApp = {
                            ...matchedApp,
                            basicInfo: {
                                dirInfo: data.integration,
                                attributes: data.directory_attributes || [],
                                attributemappings: data.attributemappings || [],
                                policy: data.policy || null,
                                scheduler: data.scheduler || null
                            }
                        };
                        setSelectedApp(filledApp);

                        // Mark steps as completed if we are in edit mode
                        updateStepCompletion(1, true);
                        if (data.attributemappings) updateStepCompletion(2, true);
                        if (data.policy) updateStepCompletion(3, true);
                        if (data.scheduler) updateStepCompletion(4, true);

                        if (stepParam) {
                            setSelectedStep(parseInt(stepParam));
                        } else {
                            setSelectedStep(1);
                        }
                    }
                }
            } else {
                // New Mode
                resetWizard();
            }
        };
        init();
    }, [searchParams, loadActiveIntegrationApps, fetchIntegrationDetails, setSelectedApp, setSelectedStep, updateStepCompletion, resetWizard]);

    const handleStepClick = (stepIdx: number) => {
        const step = steps[stepIdx];
        console.log(step);
        if (step.isEnabled || step.isCompleted) {
            setSelectedStep(step.step);
        }
    };

    const handleNextStep = () => {
        // Mark current step as complete and move to next
        updateStepCompletion(selectedStep, true);
        const nextStep = selectedStep + 1;
        if (nextStep <= 5) {
            setSelectedStep(nextStep);
        }
    };

    const handleBack = () => {
        navigate(-1);
        resetWizard();
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>

            {/* Stepper */}
            {selectedStep > 0 && selectedStep < 5 && (
                <div className="flex justify-end pe-10 mb-6">
                    <div className="flex flex-row text-sm">
                        {steps.map((item, index) => (
                            <div
                                key={item.step}
                                className={cn(
                                    "flex flex-row ml-10 items-center",
                                    (item.isEnabled || item.isCompleted) ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                )}
                                onClick={() => handleStepClick(index)}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2",
                                    item.isCompleted ? "bg-transparent" : (selectedStep === item.step ? "bg-white border border-blue-600 text-blue-600" : "bg-blue-600 text-white")
                                )}>
                                    {item.isCompleted ? (
                                        <img src={VerifiedTick} className="h-5 w-5" alt="Done" />
                                    ) : (
                                        item.step
                                    )}
                                </div>
                                <span className={cn(selectedStep === item.step ? "text-blue-700 font-medium" : "text-gray-600")}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 0: App Selection */}
            {selectedStep === 0 && !searchParams.get('id') && (
                <>
                    <h3 className="mt-3 text-sm font-medium">Add Details</h3>
                    <div className="flex flex-wrap mt-4">
                        {loading.integrationAppLoading ? (
                            <div className="w-full flex justify-center items-center h-40">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Loading...
                            </div>
                        ) : (
                            activeIntegrationApps.map(app => (
                                <div
                                    key={app.id}
                                    className={cn(
                                        "relative w-[170px] h-[170px] hover:bg-gray-200 hover:opacity-75 flex justify-center cursor-pointer flex-col m-2 border rounded",
                                        selectedApp?.appName === app.appName ? "border-blue-600" : "hover:border-blue-600"
                                    )}
                                    onClick={() => setSelectedApp(app)}
                                >
                                    <div className="rounded flex flex-row justify-center p-5">
                                        <img src={app.iconUrl} alt={app.appName} className="w-[150px] object-contain" />
                                    </div>
                                    <div className="bg-gray-200 absolute bottom-0 w-full text-center py-2">
                                        <div className="text-sm">{app.appName}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="my-4 flex justify-end items-center">
                        <Button disabled={!selectedApp} onClick={() => setSelectedStep(1)}>Next</Button>
                    </div>
                </>
            )}

            {/* Loading specific for Edit Mode - when ID exists but step still 0 or app not set */}
            {!!searchParams.get('id') && selectedStep === 0 && (
                <div className="w-full flex justify-center items-center h-40">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading configuration...
                </div>
            )}

            {/* Step 1: Basic Information */}
            {selectedStep === 1 && selectedApp && (
                <div className="mt-6 ml-4">
                    {selectedApp.appName === "Azure" && <AzureBasicInformation selectedApp={selectedApp} />}
                    {selectedApp.appName === "AWS Cognito" && <AwsCognitoBasicInformation selectedApp={selectedApp} />}
                    {selectedApp.appName === "Google Workspace" && <GoogleWorkspaceBasicInformation selectedApp={selectedApp} />}
                    {selectedApp.appName === "Auth0" && <AuthBasicInformation selectedApp={selectedApp} />}
                    {selectedApp.appName === "LDAP" && <LdapBasicInformation selectedApp={selectedApp} />}

                    {/* 
                       Note: In React version, the "Next/Save" buttons are usually INSIDE these components.
                       If we want to mimic Angular where parent controls button, we'd need to lift state.
                       For now, assuming components handle their own transition via store or props.
                       But wait, the components trigger 'onNext'. We need to pass that prop if they stick to step 1.
                       Actually, BasicInfo components currently MIGHT NOT accept onNext if they were built earlier? 
                       Let's check AzureBasicInformation props.
                    */}
                </div>
            )}

            {/* Step 2: User Mapping */}
            {selectedStep === 2 && selectedApp && (
                <div className="mt-6 ml-4">
                    <UserMapping selectedApp={selectedApp} onNext={handleNextStep} />
                </div>
            )}

            {/* Step 3: Policies */}
            {selectedStep === 3 && selectedApp && (
                <div className="mt-6 ml-4">
                    <Policies selectedApp={selectedApp} onNext={handleNextStep} />
                </div>
            )}

            {/* Step 4: Scheduler */}
            {selectedStep === 4 && selectedApp && (
                <div className="mt-6 ml-4">
                    <Schedular selectedApp={selectedApp} onNext={handleNextStep} />
                </div>
            )}

            {/* Step 5: Job Details */}
            {selectedStep === 5 && selectedApp && (
                <div className="mt-6 ml-2">
                    <div className="text-sm text-gray-600 ml-2 mb-4">
                        <span className="font-bold"> Note : </span> When the policy is enabled in the Directory, only the filtered list of users from the view jobs will be onboarded, and they will be the only users included in the tenant user list.
                    </div>
                    <JobDetails selectedApp={selectedApp} onNext={handleNextStep} />
                </div>
            )}

        </div>
    );
};

export default AddDirectoryComponent;
