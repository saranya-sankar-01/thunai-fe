import React, { useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useDirectoryTabStore } from "../store/directoryTabStore"
import { cn, getPaginationNumbers } from "../lib/utils"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { AppIntegration } from "../types/AppIntegration"

const DirectoryTab: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { loadIntegratedApps, deleteIntegration, loading, integratedApps, currentPage, setCurrentPage, totalPages } = useDirectoryTabStore();

  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteName, setDeleteName] = React.useState<string>("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  useEffect(() => {
    loadIntegratedApps([])
  }, [loadIntegratedApps])

  const handleDeleteClick = (app: any) => {
    setDeleteId(app.id)
    setDeleteName(app.integrationType)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const userInfoString = localStorage.getItem("userInfo")
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {}

    const payload = {
      infisigntenantId: userInfo.default_tenant_id,
      tenantUniqueIdentifier: userInfo.urlidentifier,
      urlIdentifier: userInfo.urlidentifier
    }

    const result = await deleteIntegration(deleteId, payload)
    setIsDeleting(false)
    setDeleteId(null)

    if (result?.status === "success") {
      toast({
        description: "Directory deleted successfully",
      })
      loadIntegratedApps([])
    } else {
      toast({
        variant: "error",
        description: result?.message || "Failed to delete directory",
      })
    }
  }

  const handleEdit = (app: AppIntegration) => {
    console.log(app)
    const userInfoString = localStorage.getItem("userInfo")
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {}

    // Config ID is usually client_id or access_key_id
    const id = app.configuration?.client_id || app.configuration?.aws_config?.access_key_id

    const params = new URLSearchParams({
      id: id,
      tenantId: userInfo.default_tenant_id,
      tenantUniqueIdentifier: userInfo.urlidentifier,
      tenantName: userInfo.org_name
    }).toString()
    navigate(`/settings/directory/import-directory-sync?${params}`)
  }

  const handleView = (app: AppIntegration) => {
    const userInfoString = localStorage.getItem("userInfo")
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {}

    // Config ID is usually client_id or access_key_id
    const id = app.configuration?.client_id || app.configuration?.aws_config?.access_key_id

    const params = new URLSearchParams({
      id: id,
      tenantId: userInfo.default_tenant_id,
      tenantUniqueIdentifier: userInfo.urlidentifier,
      tenantName: userInfo.org_name,
      step: "5" // Job Details step
    }).toString()

    navigate(`/settings/directory/import-directory-sync?${params}`)
  }

  return (
    <div className="my-4">
      <div className="text-right mb-2">
        <Button onClick={() => navigate("/settings/directory/import-directory-sync")}>
          Add Directory
        </Button>
      </div>

      <div className="border rounded-md shadow-sm bg-white overflow-hidden w-full">
        <div className={cn("overflow-y-auto relative", totalPages > 1 ? "max-h-[60vh]" : "max-h-[65vh]")}>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>APP TYPE</TableHead>
                <TableHead>CREATED DATE</TableHead>
                <TableHead>NO.OF USERS</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.integrationAppLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : (!loading.integrationAppLoading && integratedApps.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                    No Integrated Apps found.
                  </TableCell>
                </TableRow>
              ) :
                (integratedApps.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="flex items-center">
                      {app.integrationType}
                    </TableCell>
                    <TableCell>
                      {format(new Date(app.created), "MMM dd, yyyy hh:mm a")}
                    </TableCell>
                    <TableCell>
                      {app.user_count || 0}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white">
                          <DropdownMenuItem onClick={() => handleView(app)}>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(app)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(app)} className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 &&
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || loading.integrationAppLoading} />
                </PaginationItem>
                {getPaginationNumbers(currentPage, totalPages).map((page, index) => (
                  <PaginationItem key={index}>
                    {
                      page === "..." ? <PaginationEllipsis /> : (<PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                        {page}
                      </PaginationLink>)
                    }
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || loading.integrationAppLoading} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        }
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the directory {deleteName}?
              <br />
              <span className="text-xs text-red-500">
                The Users from the Directory won't be able to access any applications. Please make sure that the Directory is not in use before deleting it.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}

export default DirectoryTab