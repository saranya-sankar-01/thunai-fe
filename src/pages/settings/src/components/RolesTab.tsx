import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/button';
import RolesTable from '../components/RolesTable';
import { useDebounce } from '@/hooks/useDebounce';
import { useRoleStore } from '../store/roleStore';

import Refresh from "../assets/images/refresh.svg";


const RolesTab: React.FC = () => {
    const navigate = useNavigate();
    const [roleQuery, setRoleQuery] = useState<string>("")
    const { loadRoles } = useRoleStore();

    const debounceRoleQuery = useDebounce(roleQuery, 300);

    useEffect(() => {
        loadRoles(debounceRoleQuery);
    }, [loadRoles, debounceRoleQuery])


    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <SearchBar type="text" placeholder="Search by role name" value={roleQuery} onChange={(e) => setRoleQuery(e.target.value)} />
                <Button onClick={() => navigate("/settings/role-management/create-role")}>Create Role</Button>
                <Button variant="secondary" onClick={() => loadRoles(debounceRoleQuery)}>
                    <img src={Refresh} alt="Refresh" className="w-4 h-4" />
                </Button>
            </div>
            <RolesTable />
        </>
    )
}

export default RolesTab