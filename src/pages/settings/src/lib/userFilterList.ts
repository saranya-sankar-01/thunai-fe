import { FilterSchema } from "@/types/FilterTypes";

export const userFilterList: FilterSchema[] = [
  { key_name: "username", label: "Username", inputtype: "textbox" as const },
  { key_name: "emailid", label: "Email ID", inputtype: "textbox" as const },
  { key_name: "role", label: "Role", inputtype: "multiselect" as const },
  {
    key_name: "status",
    label: "Status",
    inputtype: "multiselect" as const,
    rowData: ["Onboarded", "Active", "InActive"],
  },
  { key_name: "created", label: "Created On", inputtype: "date" as const },
];
