import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

import SearchBar from '@/components/ui/SearchBar'
import { Button } from '@/components/ui/button'
import UsersTable from '../components/UsersTable';
import UsersFilters from '../components/UsersFilters';
import CreateEditUserDialog from '../components/CreateEditUserDialog';
import { useUserStore } from '../store/userStore';
import { usePermissions } from "../services/permissionService";
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { User } from '../types/User';
import { FilterCondition, FilterSchema } from '../types/FilterTypes';

import Filter from "../assets/images/filter_alt.svg";
import Refresh from "../assets/images/refresh.svg";

const schema = z.object({
    username: z.string().min(2, "Username must be at least 2 characters"),
    emailid: z.string().email("Invalid email format"),
    role: z.string().nonempty("Role is required"),
    default_tenant_id: z.array(z.string()).optional()
}).refine((data) => data.role === "Super Admin" || data.default_tenant_id, {
    message: "Tenant selection is required!",
    path: ["default_tenant_id"]
})

export type FormValues = z.infer<typeof schema>;

const UsersTab: React.FC = () => {
    const [viewUserFilter, setViewUserFilter] = useState<boolean>(false);
    const [createUserDialog, setCreateUserDialog] = useState<boolean>(false);
    const [editUserId, setEditUserId] = useState<string | null>(null);
    const [openMode, setOpenMode] = useState<"create" | "edit" | "view">("create");

    //Filters
    const [userQuery, setUserQuery] = useState<string>("")
    const [userFilters, setUserFilters] = useState<FilterSchema[]>([])
    const [selectedFilters, setSelectedFilters] = useState<FilterSchema[]>([]);
    const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const { hasPermission } = usePermissions();


    const { loadUsers, resetPagination } = useUserStore();

    const debounceUserQuery = useDebounce(userQuery, 300);

    useEffect(() => {
        resetPagination();
    }, [debounceUserQuery, resetPagination])

    const handleRefresh = () => {
        setUserFilters([]);
        setUserQuery("");
        setFilterConditions([]);
        setSelectedFilters([]);
        setSelectedIndex(null);
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: "",
            emailid: "",
            role: "",
            default_tenant_id: []
        }
    });

    useEffect(() => {
        const filters = {
            filter: userFilters,
            ...(debounceUserQuery && { q: debounceUserQuery })
        }
        loadUsers(filters)
    }, [loadUsers, userFilters, debounceUserQuery]);

    const handleCreateUserDialog = () => {
        setCreateUserDialog(true);
        setOpenMode("create")
    }

    const handleEditUser = (user: User, mode: "edit" | "view" = "edit") => {
        form.setValue("username", user.username);
        form.setValue("emailid", user.emailid);
        form.setValue("role", user.role);

        setEditUserId(user.user_id);
        setCreateUserDialog(true);
        setOpenMode(mode)
    }

    return (
        <>
            <div className={cn("fixed inset-y-0 right-0 z-50 w-[550px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out", viewUserFilter ? "translate-x-0" : "translate-x-full")}>
                <UsersFilters onCloseFilter={setViewUserFilter} setUserFilters={setUserFilters} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterConditions={filterConditions} setFilterConditions={setFilterConditions} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
            </div>
            {viewUserFilter &&
                <div className='fixed inset-0 z-6' onClick={() => setViewUserFilter(false)} />
            }
            {createUserDialog && <CreateEditUserDialog createUserDialog={createUserDialog} setCreateUserDialog={setCreateUserDialog} form={form} editUserId={editUserId} setEditUserId={setEditUserId} openMode={openMode} />}
            <div className="flex flex-wrap items-center gap-3">
                <SearchBar type="text" placeholder="Search by Username" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
                {hasPermission("accounts_admin", "ALL") && <Button onClick={() => handleCreateUserDialog()}>Invite</Button>}
                <div className="relative">
                    <button
                        className="flex items-center text-primary hover:text-primaryHover hover:bg-brandPrimaryHover hover:border-primaryHover bg-white gap-2 px-3 py-2 rounded-lg border border-primary transition-all duration-300 group"
                        onClick={() => setViewUserFilter(true)}
                    >
                        <img src={Filter} alt="Filter" />
                        <span className="relative font-semibold sm:block hidden">Filters</span>
                    </button>
                    {userFilters?.length > 0 &&
                        <button className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-400 text-white rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-110 active:scale-100 transition-all duration-300" onClick={() => setUserFilters([])}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    }
                </div>
                <Button variant="secondary" onClick={() => handleRefresh()}>
                    <img src={Refresh} alt="Refresh" className="w-4 h-4" />
                </Button>
            </div>

            <UsersTable onEditUser={handleEditUser} />

        </>
    )
}

export default UsersTab