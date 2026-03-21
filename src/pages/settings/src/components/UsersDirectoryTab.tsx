import React, { useEffect, useState } from 'react'
import SearchBar from "@/components/ui/SearchBar"
import { Button } from "@/components/ui/button";
import UsersDirectoryTable from "../components/UsersDirectoryTable";
import CreateEditDirectoryUserDialog from "../components/CreateEditDirectoryUserDialog";
import BulkUploadDialog from "../components/BulkUploadDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsersDirectoryStore } from "../store/usersDirectoryStore";
import { UserDirectory } from "../types/UserDirectory";

import RefreshIcon from "../assets/images/refresh.svg";

const UsersDirectoryTab: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [openCreateUser, setOpenCreateUser] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<UserDirectory | null>(null);
    const [openBulkUpload, setOpenBulkUpload] = useState<boolean>(false);


    const { loadDirectoryUsers, resetPagination } = useUsersDirectoryStore();
    const debounceQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        resetPagination();
    }, [debounceQuery, resetPagination]);

    useEffect(() => {
        const filter = debounceQuery.trim() ? [{
            key_name: "email",
            key_value: debounceQuery,
            operator: "like"
        }] : [];

        loadDirectoryUsers(filter);
    }, [loadDirectoryUsers, debounceQuery]);

    const handleRefresh = () => {
        setSearchQuery("");
    };

    const handleEditDialog = (value: UserDirectory) => {
        setSelectedUser(value);
        setOpenCreateUser(true);
    };

    return (
        <>
            <BulkUploadDialog open={openBulkUpload} setOpen={setOpenBulkUpload} />
            <CreateEditDirectoryUserDialog open={openCreateUser} setOpen={setOpenCreateUser} editData={selectedUser} setEditData={setSelectedUser} />
            <div className="my-4">
                <div className="flex flex-wrap items-end justify-end gap-4 mb-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <SearchBar type="text" placeholder="Search by EmailID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <Button onClick={() => setOpenCreateUser(true)}>
                            Add User
                        </Button>
                        <Button onClick={() => setOpenBulkUpload(true)}>
                            Bulk Upload
                        </Button>
                        <Button variant="ghost" onClick={handleRefresh}>
                            <img src={RefreshIcon} alt="Refresh" className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <UsersDirectoryTable handleEditDialog={handleEditDialog} />
            </div>
        </>
    )
}

export default UsersDirectoryTab