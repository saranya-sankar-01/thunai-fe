import React, { useEffect, useState } from 'react'
import EmailTemplatesTable from "../components/EmailTemplatesTable"
import PageTitle from "../components/PageTitle"
import SearchBar from "@/components/ui/SearchBar"
import { useEmailTemplateStore } from "../store/emailTemplateStore"
import { useDebounce } from "@/hooks/useDebounce"

const EmailTemplates: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { loadEmailTemplates } = useEmailTemplateStore();

  const debounceQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const filter = debounceQuery.trim() ? [{ key_name: "template_key", key_value: debounceQuery, operator: "like", inputtype: "textbox" }] : [];
    loadEmailTemplates(filter);
  }, [loadEmailTemplates, debounceQuery]);

  

  return (
    <>
      <PageTitle title="Email Templates" />
      <hr />
      <div className="mt-4">
        <SearchBar type="text" placeholder="Search template..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <EmailTemplatesTable />
      </div>
    </>
  )
}

export default EmailTemplates