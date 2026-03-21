import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MembersTab from '../components/MembersTab';
import PermissionsTab from '../components/PermissionsTab';

const RolesDetails: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const location = useLocation();

  const isEdit = location.pathname.includes('edit-role');
  const isCreate = location.pathname.includes('create-role');

  const method = isCreate ? 'create' : isEdit ? 'edit' : 'view';

  const [activeTab, setActiveTab] = useState<"permissions" | "members">(isCreate ? "permissions" : "members");

  return (
    <div className="bg-white text-gray-900 font-sans">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span>Back</span>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isCreate ? "Create Role" : role}
          </h1>
        </div>
      </div>

      <div className="mt-6 border-b border-gray-200">
        <div className="flex justify-between text-sm font-medium text-gray-700 select-none">
          <div className="flex space-x-8">
            {!isCreate && (
              <div className={cn('pb-4 transition-colors', activeTab === 'members' && 'border-b-2 border-blue-600 text-blue-600')}>
                <button
                  onClick={() => setActiveTab("members")}
                  className="px-1"
                >
                  Members
                </button>
              </div>
            )}
            <div className={cn('pb-4 transition-colors', activeTab === 'permissions' && 'border-b-2 border-blue-600 text-blue-600')}>
              <button
                onClick={() => setActiveTab("permissions")}
                className="px-1"
              >
                Permissions
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "members" && !isCreate && role && <MembersTab role={role} />}
        {activeTab === "permissions" && (
          <PermissionsTab roleName={role} method={method} />
        )}
      </div>
    </div>
  )
}

export default RolesDetails;