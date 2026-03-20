import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import RetainDialog from "../components/RetainDialog";
import { useSubscriptionStore } from "../store/subscriptionStore"

import DowngradeIcon from "../assets/images/downgrade.svg";
import InfoIcon from "../assets/images/info.svg";

type PlanDowngradingDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const PlanDowngradingDialog: React.FC<PlanDowngradingDialogProps> = ({ open, setOpen }) => {
    const [openRetainDialog, setOpenRetainDialog] = useState<boolean>(false);
    const { matchedPlan, subscription } = useSubscriptionStore();

    const handleRetainDowngrade = () => {
        setOpen(false);
        setOpenRetainDialog(true);
    }

    return (
        <>
            <RetainDialog openDialog={openRetainDialog} setOpenDialog={setOpenRetainDialog} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl p-0 block" aria-describedby="">
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                    </DialogHeader>
                    <div className="bg-white flex flex-col radius-md sm:rounded-lg md:flex-row">
                        <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                <img src={DowngradeIcon} alt="Downgrade" className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">You're Downgrading</h2>
                            <p className="text-sm text-gray-600">
                                When you downgrade from a higher plan, your storage capacity will be reduced.
                                You will no longer be able to upload new documents to the Brain. However,
                                your existing files will remain safe and accessible.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={() => setOpen(false)}>Maybe Later</Button>
                                <Button onClick={handleRetainDowngrade}>Downgrade</Button>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 bg-yellow-50 px-6 py-6 border-l rounded-r-lg border-gray-200 relative">
                            <div className="align-items">
                                <h3 className="text-center font-semibold text-gray-800">
                                    Plan Downgrading {subscription.subscription.name} To {matchedPlan?.name || 'Free'}
                                </h3>
                                <ul className="space-y-3 text-sm text-gray-700 m-3">
                                    <li className="flex items-center gap-2  text-center">
                                        <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                        Storage capacity will reduce
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                        They can no longer upload new documents
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                        Existing documents will still be retained
                                    </li>
                                    {matchedPlan?.feature_mapping.chat_agent !== 0 && matchedPlan?.feature_mapping.chat_agent !== undefined &&
                                        <li className="flex items-center gap-2">
                                            <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                            Chat Agent {matchedPlan?.feature_mapping.chat_agent === null ? 'Unlimited' :
                                                matchedPlan?.feature_mapping.chat_agent} Allowed
                                        </li>
                                    }
                                    {matchedPlan?.feature_mapping.voice_agent != 0 && matchedPlan?.feature_mapping.chat_agent != undefined &&
                                        <li className="flex items-center gap-2">
                                            <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                            voice Agent {matchedPlan?.feature_mapping.voice_agent === null ? 'Unlimited' :
                                                matchedPlan?.feature_mapping.voice_agent} Allowed
                                        </li>
                                    }
                                    {matchedPlan?.feature_mapping.email_agent != 0 && matchedPlan?.feature_mapping.chat_agent != undefined &&
                                        <li className="flex items-center gap-2">
                                            <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                            Email Agent {matchedPlan?.feature_mapping.email_agent === null ? 'Unlimited' :
                                                matchedPlan?.feature_mapping.email_agent} Allowed
                                        </li>
                                    }
                                    {matchedPlan?.feature_mapping.calendar != 0 && matchedPlan?.feature_mapping.chat_agent != undefined &&
                                        <li className="flex items-center gap-2">
                                            <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                            Calendar {matchedPlan?.feature_mapping.calendar === null ? 'Unlimited' :
                                                matchedPlan?.feature_mapping.calendar} Allowed
                                        </li>
                                    }
                                    {matchedPlan?.feature_mapping.chat_agent != 0 && matchedPlan?.feature_mapping.chat_agent == undefined &&
                                        <li className="flex items-center gap-2">
                                            <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                            Chat Agent 1 Allowed
                                        </li>
                                    }
                                    {matchedPlan?.feature_mapping.voice_agent != 0 && matchedPlan?.feature_mapping.chat_agent == undefined &&
                                        <li className="flex items-center gap-2">
                                            <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                            voice Agent not Allowed
                                        </li>
                                    }
                                    {matchedPlan?.feature_mapping.email_agent != 0 && matchedPlan?.feature_mapping.chat_agent == undefined &&
                                        <li className="flex items-center gap-2">
                                            <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                            Email Agent not Allowed
                                        </li>
                                    }
                                    {matchedPlan?.feature_mapping.calendar != 0 && matchedPlan?.feature_mapping.chat_agent == undefined &&
                                        <li className="flex items-center gap-2">
                                            <img src={InfoIcon} alt="" className="h-6 w-6 mt-1" />
                                            Calendar 1 Allowed
                                        </li >
                                    }
                                </ul >
                                <div className="pt-6 text-sm text-gray-800">
                                    Have a question? <span className="text-blue-600 hover:underline">Contact our team</span>
                                </div>
                            </div >
                        </div >
                    </div >
                </DialogContent >
            </Dialog >
        </>
    )
}

export default PlanDowngradingDialog