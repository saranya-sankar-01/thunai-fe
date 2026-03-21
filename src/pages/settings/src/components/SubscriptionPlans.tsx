import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import SubscriptionPlanSkeleton from "../components/SubscriptionPlanSkeleton";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { cn } from "@/lib/utils"
import { SubscriptionPlan } from "../types/SubscriptionPlan";


import PlanDowngradingDialog from "./PlanDowngradingDialog";

const SubscriptionPlans: React.FC = () => {
    const [selected, setSelected] = useState<"month" | "year">("month");
    const [checkDowngradeDialog, setCheckDowngradeDialog] = useState<boolean>(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(null);

    const { loadPlans, plans, loading, subscription, checkDowngrade, suggestedPlan } = useSubscriptionStore();

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const calculateYearlyPrice = (amount: number): number => {
        return Math.round(amount / 100 / 12);
    }
    const handlePlanText = (plan: SubscriptionPlan) => {
        const monthlyPlan = plan.strip_plan[0];
        const yearlyPlan = plan.strip_plan[1];

        let priceLabel: string = "Free";

        if (monthlyPlan.unit_amount > 0) {
            if (selected === "month") {
                priceLabel = `$${monthlyPlan.unit_amount / 100}`
            } else if (selected === "year" && yearlyPlan) {
                priceLabel = `$${calculateYearlyPrice(yearlyPlan.unit_amount)}`
            }
        }

        return priceLabel;
    }

    const handleSubscriptionPlan = async (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        plan.default_price = selected === "year" ? plan.strip_plan[1].id : plan.strip_plan[0].id;

        await checkDowngrade(plan);

        if (!loading.loadingCheckDowngrade && suggestedPlan.length > 0) {
            setCheckDowngradeDialog(true);
        }

        setSelectedPlan(null);
    }

    // useEffect(() => {
    //     if (!loading.loadingCheckDowngrade && suggestedPlan.length > 0) {
    //         setCheckDowngradeDialog(true);
    //     }
    // }, [loading.loadingCheckDowngrade, suggestedPlan]);

    if (loading.planLoading) return <SubscriptionPlanSkeleton />

    return (
        <>
            <PlanDowngradingDialog open={checkDowngradeDialog} setOpen={setCheckDowngradeDialog} />
            <h2 className="text-lg md:text-xl font-semibold md:font-bold text-gray-900 mb-6">Available Plans</h2>
            <div className="flex justify-end mb-6">
                <div className="inline-flex rounded-lg border border-gray-200">
                    <button className={cn("px-2 py-1 md:px-4 md:py-2 rounded-l-lg", selected === "month" && "bg-blue-600 text-white")} onClick={() => setSelected("month")}>
                        Monthly
                    </button>
                    <button className={cn("px-2 py-1 md:px-4 md:py-2 rounded-r-lg", selected === "year" && "bg-blue-600 text-white")} onClick={() => setSelected("year")} >
                        Annual
                        <span className={cn("ml-1 text-[12px] md:text-xs", selected !== "year" && "text-blue-600")}>Save 20%</span>
                    </button>
                </div>
            </div>
            <div className=" w-full overflow-x-auto">
                <div className="flex gap-3 items-stretch">
                    {plans.map(plan => {
                        const monthlyPlan = plan.strip_plan[0];
                        const yearlyPlan = plan.strip_plan[1];
                        const isPaid = monthlyPlan.unit_amount > 0;

                        const currentPlan = plan.current_plan;
                        const freePlan = plan.name === "free";

                        let buttonContent: React.ReactNode;

                        if (currentPlan) {
                            buttonContent = <span className="flex justify-center ">
                                <img src="./../../../assets/images/check_circle.svg" alt="check_circle" className="m-1" />
                                Current Plan
                            </span>
                        } else if (freePlan) {
                            buttonContent = "Choose Plan";
                        } else if (plan.trial_days === 10) {
                            buttonContent = "Start 10-day free trial";
                        } else {
                            buttonContent = "Subscribe";
                        }

                        return (
                            <div key={plan.display_name} className="xs:min-w-[100%] sm:min-w-[calc(50%-16px)] lg:min-w-[calc(33%-16px)] xl:min-w-[calc(25%-16px)] px-2 py-4">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg w-full h-full">
                                    <div className="relative">
                                        <h3 className="text-lg md:text-xl font-bold px-6 pt-6">{plan.display_name}</h3>
                                        {plan.display_name === "Starter" && <div
                                            className="absolute top-13 md:top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                                            Most popular
                                        </div>}
                                    </div>
                                    <div className="p-6">
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                            {handlePlanText(plan)}
                                        </h2>
                                        <section className="text-gray-500 text-[12px] md:text-xs flex flex-col gap-1">
                                            {isPaid ? (
                                                <p className="flex items-center">
                                                    <span>
                                                        /
                                                        {selected === "year"
                                                            ? "month, billed annually"
                                                            : " month"}
                                                        {selected === "year" && yearlyPlan && (
                                                            <strong className="text-blue-600 ml-1 font-medium">
                                                                -20% off
                                                            </strong>
                                                        )}
                                                    </span>

                                                </p>
                                            ) : (
                                                <p>Always Free, Forever</p>
                                            )}
                                            <p>Unlimited Seats</p>
                                        </section>
                                    </div >
                                    <div className="px-6">
                                        <Button className={cn("w-full", plan.current_plan && "bg-brand-primary hover:bg-primary", !plan.current_plan && "bg-primary hover:bg-primary")} disabled={subscription.subscription.name === plan.name || selectedPlan?.name === plan.name || plan.strip_plan[0].unit_amount === 0 || plan.current_plan} onClick={() => handleSubscriptionPlan(plan)}>
                                            {loading.loadingCheckDowngrade && selectedPlan?.name === plan.name ? <div className="flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                            </div> : buttonContent}
                                        </Button>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-medium mb-4">Workspace</h4>
                                        <ul className="space-y-3">

                                            <li className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                <span>{
                                                    plan.tenants === null
                                                        ? 'Unlimited'
                                                        : plan.tenants === 1
                                                            ? '1 Project'
                                                            : plan.tenants + ' Projects'
                                                }</span>
                                            </li>


                                            <li className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                <span>
                                                    {
                                                        plan.storage === null
                                                            ? 'Unlimited storage'
                                                            : plan.storage < 1024 ? plan.storage + ' MB storage' : (plan.storage / 1024).toFixed(0)
                                                                + ' GB storage'
                                                    } </span>
                                            </li>

                                            <li className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                <span>{plan.credits} credits included</span>
                                            </li>

                                            <li className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                <span> Seats - {plan?.seats ?? 'Unlimited'} </span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="px-6 pb-6">
                                        <h4 className="font-medium mb-4">Features included</h4>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <svg className="flex-shrink-0 w-5 h-5 text-blue-600" width="20" height="20" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    <span className="flex-1">
                                                        {feature?.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div >
                        )
                    }
                    )}
                </div>
            </div>
        </>
    )
}

export default SubscriptionPlans