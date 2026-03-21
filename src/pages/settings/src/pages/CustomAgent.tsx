import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import PageTitle from '../components/PageTitle';
import { Button } from '@/components/ui/button';
import CustomAgentSection from '../components/CustomAgentSection';
import CreateEditCustomAgentDialog from '../components/CreateEditCustomAgentDialog';

const schema = z.object({
  uniquerUserName: z.string().nonempty("URL is required.").regex(/^\S+$/, "URL cannot contain spaces"),
  common_widget_id: z.string().nonempty("Please select common agent."),
  title: z.string().nonempty("Title is required"),
  description: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional()
})

export type FormValues = z.infer<typeof schema>;


const CustomAgent: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      common_widget_id: "",
      uniquerUserName: "",
      primary_color: "#000000",
      secondary_color: "#000000"
    }
  })

  return (
    <div>
      <PageTitle title="Custom Agents" content="Manage and customize your AI agents for specific workflows.">
        <Button onClick={() => setOpenDialog(true)}>+ Create</Button>
      </PageTitle>
      <hr />
      <CustomAgentSection form={form} setEditId={setEditId} setOpenDialog={setOpenDialog} />
      <CreateEditCustomAgentDialog form={form} editId={editId} setEditId={setEditId} setOpenDialog={setOpenDialog} openDialog={openDialog} />
    </div>
  )
}

export default CustomAgent