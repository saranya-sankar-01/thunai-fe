import React, { useState } from 'react'
import PageTitle from '../components/PageTitle'
import UserTabButton from '../components/UserTabButton'
import UsersTab from '../components/UsersTab';
import RolesTab from '../components/RolesTab';

import UsersImage from "../assets/images/admin_panel_settings.svg";
import RolesImage from "../assets/images/supervisor_account.svg";

const UserManagement: React.FC = () => {
  const [selected, setSelected] = useState<"Users" | "Roles">("Users");

  return (
    <div>
      <PageTitle title="User Management" content="Manage User Access, Roles, and Permissions" />
      <hr />
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
        <div className="flex gap-3">
          <UserTabButton title="Users" selected={selected} source={UsersImage} alt="Users" onClick={setSelected} />
          <UserTabButton title="Roles" selected={selected} source={RolesImage} alt="Roles" onClick={setSelected} />
        </div>
        {selected === "Users" && <UsersTab />}
        {selected === "Roles" && <RolesTab />}
      </div>
    </div>
  )
}

export default UserManagement