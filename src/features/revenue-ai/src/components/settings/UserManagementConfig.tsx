import React, { useEffect, useState } from 'react';
import { Users, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Search, UserPlus } from 'lucide-react';
import z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUserManagementStore } from '../../store/userManagementStore';
import CreateEditUser from './CreateEditUser';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '../../types/User';

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: string;
  managerId: string | null;
}

const schema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  role: z.string().nonempty("Role is required"),
  reports_to: z.string().optional(),
})

export type FormValues = z.infer<typeof schema>;

const initialUsers: OrgUser[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'VP Sales', managerId: null },
  { id: '2', name: 'Michael Torres', email: 'michael.t@company.com', role: 'Sales Director', managerId: '1' },
  { id: '3', name: 'Emily Watson', email: 'emily.w@company.com', role: 'Sales Manager', managerId: '2' },
  { id: '4', name: 'James Park', email: 'james.p@company.com', role: 'Account Executive', managerId: '3' },
  { id: '5', name: 'Lisa Johnson', email: 'lisa.j@company.com', role: 'Account Executive', managerId: '3' },
  { id: '6', name: 'David Kim', email: 'david.k@company.com', role: 'Sales Manager', managerId: '2' },
  { id: '7', name: 'Anna Schmidt', email: 'anna.s@company.com', role: 'Account Executive', managerId: '6' },
  { id: '8', name: 'Robert Patel', email: 'robert.p@company.com', role: 'SDR', managerId: '6' },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

const roleColors: Record<string, string> = {
  'VP Sales': 'bg-purple-100 text-purple-700 border-purple-200',
  'Sales Director': 'bg-blue-100 text-blue-700 border-blue-200',
  'Sales Manager': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Account Executive': 'bg-amber-100 text-amber-700 border-amber-200',
  'SDR': 'bg-gray-100 text-gray-700 border-gray-200',
};

interface TreeNodeProps {
  user: User;
  users: User[];
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  level: number;
}

const TreeNode = ({ user, users, expandedNodes, toggleNode, onEdit, onDelete, level }: TreeNodeProps) => {
  console.log(users);
  const children = users.filter(u => u.reports_to_id === user.user_id);
  console.log(children);
  const hasChildren = children.length > 0;
  const isExpanded = expandedNodes.has(user.id);

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <button
          onClick={() => hasChildren && toggleNode(user.id)}
          className="w-5 h-5 flex items-center justify-center shrink-0"
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />
          ) : <span className="w-3.5" />}
        </button>

        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
            <Badge variant="outline" className={`text-xs shrink-0 ${roleColors[user.role] || 'bg-muted text-muted-foreground'}`}>
              {user.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        {hasChildren && (
          <span className="text-xs text-muted-foreground shrink-0">{children.length} report{children.length > 1 ? 's' : ''}</span>
        )}

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(user)}>
            <Pencil size={13} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(user)}>
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {isExpanded && children.map(child => (
        <TreeNode
          key={child.id}
          user={child}
          users={users}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      ))}
    </div>
  );
};

export const UserManagementConfig = () => {
  const { users, loading, loadUsers, deleteUser } = useUserManagementStore();
  // const [users, setUsers] = useState<OrgUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2']));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // console.log(orgUsers, "ORG USERS");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      reports_to: '',
    }
  })

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedNodes(new Set(users.map(u => u.id)));
  const collapseAll = () => setExpandedNodes(new Set());

  const openAddDialog = () => {
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    // console.log(user);
    form.setValue("name", user.name);
    form.setValue("email", user.email);
    form.setValue("role", user.role);
    form.setValue("reports_to", user.reports_to_email?.email ?? "");
    setEditingUser(user.id);
    setDialogOpen(true);
  };

  // const handleSave = () => {
  //   if (!formName || !formEmail) {
  //     toast.error('Please fill in name and email');
  //     return;
  //   }
  //   const managerId = formManager === 'none' ? null : formManager;

  //   if (editingUser) {
  //     setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: formName, email: formEmail, role: formRole, managerId } : u));
  //     toast.success(`Updated ${formName}`);
  //   } else {
  //     const newUser: OrgUser = { id: crypto.randomUUID(), name: formName, email: formEmail, role: formRole, managerId };
  //     setUsers(prev => [...prev, newUser]);
  //     toast.success(`Added ${formName}`);
  //   }
  //   setDialogOpen(false);
  // };

  const handleDelete = (user: User) => {
    console.log(user);
    const foundUser = users.find(u => u.id === user.id);
    const reports = users.filter(u => u.id === user.id);
    // Re-assign reports to deleted user's manager
    // deleteUser(user);

    const reassignReports = users.filter(u => u.id !== user.id).map(u => u.reports_to_id === user.id ? { ...u, reports_to_id: foundUser.reports_to_id || null } : u);
    console.log(reassignReports);

    // setUsers(prev => prev.filter(u => u.id !== id).map(u => u.managerId === id ? { ...u, managerId: user?.managerId || null } : u));
    toast.success(`Removed ${user?.name}${reports.length ? ` — ${reports.length} report(s) reassigned` : ''}`);
  };

  const rootUsers = users.filter(u => u.reports_to_id === null);

  // console.log(rootUsers);

  const filteredUsers = search
    ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()))
    : [];

  console.log(filteredUsers);

  const getManagerName = (managerId: string | null) => {
    if (!managerId) return '—';
    return users.find(u => u.user_id === managerId)?.name || '—';
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage team members and reporting hierarchy</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/30">
          <Button variant={viewMode === 'tree' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => { setViewMode('tree'); setSearch(''); }}>
            Org Tree
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setViewMode('list')}>
            List
          </Button>
        </div>

        {viewMode === 'tree' && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={expandAll}>Expand All</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={collapseAll}>Collapse All</Button>
          </div>
        )}

        <Button size="sm" onClick={openAddDialog} className="gap-1.5">
          <UserPlus size={14} />
          Add User
        </Button>
      </div>

      {/* Search results */}
      {search && (
        <div className="border rounded-lg bg-card mb-4">
          <div className="p-3 border-b bg-muted/30">
            <span className="text-sm text-muted-foreground">{filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}</span>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No users found</div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{user.name}</span>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${roleColors[user.role] || ''}`}>{user.role}</Badge>
                  <span className="text-xs text-muted-foreground">Reports to: {getManagerName(user.reports_to_id)}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(user)}><Pencil size={13} /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tree View */}
      {!search && viewMode === 'tree' && (
        <div className="border rounded-lg bg-card">
          {loading.usersLoading && <div className="flex justify-center items-center h-[400px]">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>}
          {(!loading.usersLoading && !users.length) && (
            <div className="flex justify-center items-center h-full">
              No Users found!
            </div>
          )}
          <div className="p-1">
            {(!loading.usersLoading && users.length > 0) && rootUsers.map(user => (
              <TreeNode
                key={user.id}
                user={user}
                users={users}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                onEdit={openEditDialog}
                onDelete={handleDelete}
                level={0}
              />
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {!search && viewMode === 'list' && (
        <div className="border rounded-lg bg-card overflow-hidden">
          {loading.usersLoading && <div className="flex justify-center items-center h-[400px]">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </div>}
          {(!loading.usersLoading && !users.length) && (
            <div className="flex justify-center items-center h-full">
              No Users found!
            </div>
          )}
          {!loading.usersLoading && users.length &&
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Reports To</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Direct Reports</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(user => {
                  const directReports = users.filter(u => u.reports_to_id === user.user_id).length;
                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{user.name}</span>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`text-xs ${roleColors[user.role] || ''}`}>{user.role}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{getManagerName(user.reports_to_id)}</td>
                      <td className="p-3 text-muted-foreground">{directReports || '—'}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(user)}><Pencil size={13} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(user)}><Trash2 size={13} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          }
        </div>
      )}

      {/* Add/Edit Dialog */}
      <CreateEditUser dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} editingUser={editingUser} setEditingUser={setEditingUser} form={form} />
    </div>
  );
};
