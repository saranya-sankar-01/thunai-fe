import DirectoryTab from "../components/DirectoryTab"
import DirectoryUserStatusTab from "../components/DirectoryUserStatusTab"
import PageTitle from '../components/PageTitle'
import SchemaTab from '../components/SchemaTab'
import SsoTab from "../components/SsoTab"
import { Button } from '@/components/ui/button'
import UsersDirectoryTab from "../components/UsersDirectoryTab"
import { cn } from '@/lib/utils'
import React, { useState } from 'react'

const Directory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"schema" | "users" | "directory" | "pending/approval" | "sso">("schema")
  return (
    <>
      <PageTitle title="Directory">
        <span className="text-gray-600 text-xs bg-gray-50 rounded-full px-3 py-1 leading-none select-none border border-gray-200 shadow-sm">Default</span>
      </PageTitle>
      <div className="mt-6 border-b border-gray-200">
        <div className="flex justify-between text-sm font-medium text-gray-700 select-none">
          <div className="flex space-x-8">
            <div className={cn(activeTab === 'schema' && 'border-b-2 border-blue-600 text-blue-600')}>
              <Button variant='ghost' onClick={() => setActiveTab("schema")}>
                Schema
              </Button>
            </div>
            <div className={cn(activeTab === 'users' && 'border-b-2 border-blue-600 text-blue-600')}>
              <Button variant='ghost' onClick={() => setActiveTab("users")}>
                Users
              </Button>
            </div>
            <div className={cn(activeTab === 'directory' && 'border-b-2 border-blue-600 text-blue-600')}>
              <Button variant='ghost' onClick={() => setActiveTab("directory")}>
                Directory
              </Button>
            </div>
            <div className={cn(activeTab === 'pending/approval' && 'border-b-2 border-blue-600 text-blue-600')}>
              <Button variant='ghost' onClick={() => setActiveTab("pending/approval")}>
                Pending/Approval
              </Button>
            </div>
            <div className={cn(activeTab === 'sso' && 'border-b-2 border-blue-600 text-blue-600')}>
              <Button variant='ghost' onClick={() => setActiveTab("sso")}>
                SSO
              </Button>
            </div>
          </div>
        </div>
      </div>
      {activeTab === "schema" && <SchemaTab />}
      {activeTab === "users" && <UsersDirectoryTab />}
      {activeTab === "directory" && <DirectoryTab />}
      {activeTab === "pending/approval" && <DirectoryUserStatusTab />}
      {activeTab === "sso" && <SsoTab />}
    </>
  )
}

export default Directory