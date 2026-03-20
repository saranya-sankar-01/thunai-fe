interface ToolItem{
    tool_name: string
    tool_id: string
    is_configure: boolean
    data: Record<string, unknown>
}

interface ApplicationItem {
    app_name: string
    tool_list: ToolItem[]
    is_master: boolean
    mcp_id: string
}

export interface ListItem{
    tenant_id: string
    user_id: string
    applications: ApplicationItem[]

}