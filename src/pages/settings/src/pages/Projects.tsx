import React, { useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import PageTitle from '../components/PageTitle'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/ui/SearchBar'
import ProjectsTable from '../components/ProjectsTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useProjectStore } from '../store/projectsStore'
import { useDebounce } from '@/hooks/useDebounce'
import { usePermissions } from "../services/permissionService";

const schema = z.object({
  name: z.string().min(2, "This field is required")
})

type FormValues = z.infer<typeof schema>;

const Projects: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const { hasPermission } = usePermissions();

  const { loadTenants, loading, createTenant } = useProjectStore();
  const debounceQuery = useDebounce(query, 300);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" }
  })

  useEffect(() => {
    const filters = debounceQuery.trim() ? [{
      key_name: "name",
      key_value: debounceQuery,
      operator: "like"
    }] : []

    loadTenants(filters)
  }, [debounceQuery, loadTenants])

  const handleCreateTenant = async (values: FormValues) => {
    await createTenant(values.name);
    form.reset();
    setOpenDialog(false);
  }

  return (
    <>
      <PageTitle title='Manage Projects' content='Change the settings for your current workspace here'>
        <div className='flex flex-col space-y-3 mb-6 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0'>
          <SearchBar type="text" placeholder='Search by project name' value={query} onChange={(e) => setQuery(e.target.value)} />
          {hasPermission("accounts_admin", "ALL") && <Button onClick={() => setOpenDialog(true)}>+ New Project</Button>}
        </div>
      </PageTitle>
      <hr className="mb-2" />
      <Dialog open={openDialog} onOpenChange={(isOpen) => {
        setOpenDialog(isOpen);
        if (!isOpen) form.reset();  // Clears input + errors
      }}>
        <DialogContent className='max-w-2xl' aria-describedby="">
          <DialogHeader>
            <DialogTitle>
              Create Project
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateTenant)} className='space-y-4'>
              <FormField control={form.control} name="name" rules={{ required: "This field is required!" }} render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Project</FormLabel> */}
                  <FormControl>
                    <Input placeholder='Enter Project Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className='flex space-x-3 justify-end'>
                <Button variant='secondary' type='button' onClick={() => { form.reset(); setOpenDialog(false) }}>Cancel</Button>
                <Button type='submit' disabled={loading} >Create</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ProjectsTable setOpenDialg={setOpenDialog} />
    </>
  )
}

export default Projects