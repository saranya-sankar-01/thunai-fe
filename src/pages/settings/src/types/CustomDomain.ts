export interface CustomDomain {
  _id: string;
  title: string;
  description: string;
  tenantId: string;
  chat_widget_id: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  share_custom_widget_id: string;
  themeColor: string | null;
  uniquerUserName: string;
  urlIdentifier: string;
  voice_widget_Id: string;
  common_widget_Id: string;
}
