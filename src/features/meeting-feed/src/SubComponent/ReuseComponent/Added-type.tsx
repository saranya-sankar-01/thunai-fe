
import TeamMeet from "../../assets/svg/Team.svg";
import GoogleMeet from "../../assets/image/meet.png";
import ZoomMeet from "../../assets/image/zoom-icone-svg-150px.png";
import Record from "../../assets/svg/Frame1.svg";
import Superviser from "../../assets/svg/Supervisor_account.svg";
import Research from "../../assets/svg/Research.svg";
import NoData from "../../assets/svg/NoData.svg";

import Webex from "../../assets/svg/Webex.svg";
import PeriodicImg from "../../assets/svg/Periodic.svg";
 const METRIC_ENDPOINT =  import.meta.env.VITE_METRICS_ENDPOINT || (window as any)['env']['METRICS_ENDPOINT'];

 import { getLocalStorageItem } from "../../Service/MeetingService";



/* ---------- HELPERS ---------- */
// const url = new URL(window.location.href);
 const userInfo = getLocalStorageItem("user_info") || {};

export const getPlatformImage = (added_type: string): string => {
      const key = added_type?.toLowerCase();
      const imageMap: Record<string, string> = {
        "gmeet": GoogleMeet,
        "meet-record": GoogleMeet,
        "teams": TeamMeet,
        "teams-record": TeamMeet,
        "zoom": ZoomMeet,
        "zoom-record": ZoomMeet,
        "recording": Record,
        "research": Research,
        "webex-record": Webex,
        "user": Superviser,
        "periodic_sync": PeriodicImg,
      };
      return imageMap[key] || NoData;
    };


    export const RoutewithMeticDashboard = () => {
  // Get all values from localStorage
  // const params = new URLSearchParams({
  //   // tenant_id: localStorage.getItem("tenant_id") || '',
  //   // csrf_token: localStorage.getItem("csrf_token") || '',
  //   // token: localStorage.getItem("agent_token") || '',
  //   // url_identifier: localStorage.getItem("url_identifier") || '',
  //   // user_id: localStorage.getItem("user_id") || '',
  //   // refresh_token: localStorage.getItem("refresh_token") || '',
  //   tenant_id: userInfo?.default_tenant_id || '',
  //   csrf_token: userInfo?.csrf_token || '',
  //   token: userInfo?.access_token || '',
  //   url_identifier: userInfo?.urlidentifier || '',
  //   user_id: userInfo?.profile?.user_id || '',
  //   refresh_token: userInfo?.refresh_token || '',
  // });

  // const urlIdentifier = localStorage.getItem("url_identifier") || '';
  // const tenantId = localStorage.getItem("tenant_id") || '';
  // const org_name = localStorage.getItem("org_name") || '';
  console.log("userinof", userInfo);
  
  const urlIdentifier =  userInfo?.urlidentifier ||localStorage.getItem("url_identifier") || '';
  const tenantId = userInfo?.default_tenant_id ||  localStorage.getItem("tenant_id") || '';
  const org_name = userInfo?.org_name || localStorage.getItem("org_name") || '';
  const encryptedParams = `data=${encodeURIComponent(localStorage.getItem('user_info') || '')}`;

  // Validate required fields
  // if (!urlIdentifier || !tenantId) {
  //   console.error('Missing required parameters in localStorage');
  //   alert("url-required");
  //   return;
  // }

  const url = `${METRIC_ENDPOINT}/dashboard/${urlIdentifier}/${tenantId}/${org_name}?${encryptedParams}`;
  
  window.open(url, '_blank', 'noopener,noreferrer');
};


