import React, { useEffect } from 'react'
import PageTitle from '../components/PageTitle'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import SubscriptionSkeleton from '../components/SubscriptionSkeleton'
import SubscriptionPlans from "../components/SubscriptionPlans"
import SubscriptionUsage from "../components/SubscriptionUsage"
import { useSubscriptionStore } from '../store/subscriptionStore'

import ErrorIcon from "../assets/images/error.svg";
import TollIcon from "../assets/images/toll.svg";
import CloudIcon from "../assets/images/cloud_done.svg";
import TenancyIcon from "../assets/images/tenancy.svg";

const SubscriptionOverview: React.FC = () => {
  const { loadSubscription, loading, subscription } = useSubscriptionStore();

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription])

  return (
    <>
      <PageTitle title="Plan & Billings" content="Manage your subscription plans and payment details">
        <Button
        // onClick={()=> window.open("https://payments.thunai.ai/p/login/14keWR5rPdP06Ri7ss", "_blank", "noopener,noreferrer")}
        >
          Manage Subscription
        </Button>
      </PageTitle>
      <hr />
      <div className="h-[calc(100vh-130px)] overflow-y-auto overflow-x-hidden p-4">
        {loading.subscriptionLoading ? <SubscriptionSkeleton /> :

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8">
            <div className="flex flex-col gap-2 md:flex-row items-start md:items-center justify-between mb-8">
              <div className="mb-4 sm:mb-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900 capitalize">{subscription?.subscription.name}</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
                </div>
                {subscription?.subscription.last_payment_done &&
                  <p className="text-gray-500">
                    Last payment: {subscription?.subscription.last_payment_done}
                  </p>}
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-gray-500">
                {subscription?.subscription.no_of_days_with_negative <= -1 && subscription?.subscription.no_of_days_with_negative >= -10 && (<div className="text-center">
                  <div className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <img
                          src={ErrorIcon} alt="Payment Missed" className="mr-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Your payment was unsuccessful. You have {10 - (Math.abs(subscription?.subscription.no_of_days_with_negative))} days left to update your payment details and continue enjoying uninterrupted access to your subscription.
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-sm mb-1">Payment Missed</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{10 - (Math.abs(subscription?.subscription.no_of_days_with_negative))}
                    day(s) left</p>
                </div>)}
                {subscription.subscription.no_of_days_with_negative <= -11 && (
                  <div className="text-center">
                    <div className="flex justify-center">
                      <img src={ErrorIcon} alt="Plan Edpired" className="mr-1" />
                      <p className="text-lg font-semibold text-red-600">Plan Expired</p>
                    </div>
                  </div>
                )}
                {subscription?.subscription.no_of_days !== 0 && (
                  <div className="text-center">
                    <p className="text-sm mb-1">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">{subscription?.subscription.no_of_days} days</p>
                  </div>
                )}
                {subscription?.subscription.trial_active && (

                  <div className="text-center">
                    <p className="text-sm mb-1">Trial Left</p>
                    <p className="text-lg font-semibold text-gray-900">{subscription?.subscription.trial_days} days</p>
                  </div>
                )}
              </div>
            </div >
            <div className="grid grid-cols-1 border-t-2 pt-2 border-gray-100 lg:grid-cols-3 gap-6">
              <SubscriptionUsage icon={TollIcon} iconBg="bg-[#CFF9FE]" usageBarBg="bg-[#22CCEE]" title="Credits Usage" subtitle="Available credits for AI operations" usage={subscription.usage.credits} total={subscription.subscription.credits} />
              <SubscriptionUsage icon={CloudIcon} iconBg="bg-[#EBE9FE]" usageBarBg="bg-[#7A5AF8]" title="Storage Usage" subtitle="Total storage space used" usage={subscription.usage.storage} total={subscription.subscription.storage} />
              <SubscriptionUsage icon={TenancyIcon} iconBg="bg-[#FDEBD7]" usageBarBg="bg-[#FDB022]" title="Active Project" subtitle="Number of active Projects" usage={subscription.usage.tenants} total={subscription.subscription.tenants} />
            </div>
          </div>
        }
        <SubscriptionPlans />
      </div>
    </>
  )
}

export default SubscriptionOverview