import { useState, useEffect, useRef } from "react";
import {getLocalStorageItem, requestApi } from "@/services/authService";
import { useSearchParams,useParams, useNavigate } from "react-router-dom";


import FileImg from "../assets/svg/FileImg.svg";

import CopyIcon from "../assets/svg/CopyIcon.svg";
import Locked from "../assets/svg/Locked.svg";
import LockOpen from "../assets/svg/LockOpen.svg";
import PreviewIcon from "../assets/svg/PreviewIcon.svg";

import { useToast } from "@/hooks/use-toast";


import Close from "../assets/svg/Close.svg";
import UpArrow from "../assets/svg/Keyboard_arrow_down1.svg";

interface ShareExportProps {
  selectedItem: any;
  CancelShareData: (status: boolean) => void;
}

const ShareExport = ({
  selectedItem,
  CancelShareData,
}: ShareExportProps) => {
  const [sharedRes, setSharedRes] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any[]>([]);
  const [searchParams] = useSearchParams();

  const { toast } = useToast();
  const navigate = useNavigate();
 
  const [validUser, setValidUser] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [IsLoading, setIsLoading] = useState<boolean>(false);
  const [sharedOption, setSharedOption] = useState("all");
  const [gentalClick, setGentalClick]=useState<number| null>(null);
  const [gentalData, setGentalData] = useState("private");
  
const Feed_id = searchParams.get("id") || useParams().id;
 const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

const dropdownRef = useRef<HTMLDivElement>(null);

// Click outside handler
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setValidUser(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(()=>{
  const CloseMouse=()=>setGentalClick(null);
  document.addEventListener("click",CloseMouse)

  return ()=> document.removeEventListener("click",CloseMouse);
},[])

  // Fixed ShareData function - removed onUserFetched parameter
  const ShareData = async () => {
    try {
      const response = await requestApi(
        "GET",
        `${tenant_id}/share/salesenablement/?id=${Feed_id}&share_type=external`,
        {},
        "authService"
      );

      const res = response?.data || {};
    setSharedRes(res);

    // Set previous selected type
    if (res?.type) {
      setGentalData(res.type);
    }
    if (res?.shared_options) {
      setSharedOption(res.shared_options);
    }

    } catch (error) {
      console.error("ShareData error:", error);
    }
  };

  const FetchUser = async () => {
    const payload = {
      filter: [],
      page: { size: 100, page_number: 1 },
      size: 5,
      sort: "dsc",
    };

    try {
      const response = await requestApi(
        "POST",
        `${tenant_id}/users/`,
        payload,
        "accountService"
      );

      const usersData = response?.data?.data;
      
      // Better normalization
      let normalized = [];
      if (Array.isArray(usersData)) {
        normalized = usersData;
      } else if (usersData && typeof usersData === 'object') {
        // If it's a single object or has nested structure
        if (usersData.data && Array.isArray(usersData.data)) {
          normalized = usersData.data;
        } else {
          normalized = [usersData];
        }
      }
      
      setCurrentUser(normalized);

    } catch (error) {
      console.error("FetchUser error:", error);
      setCurrentUser([]);
    }
  };

  useEffect(() => {
    ShareData();
    FetchUser();
  }, []);

  const filteredUsers = currentUser.filter((user: any) => {
    const term = searchTerm.toLowerCase();
    return (
      user?.username?.toLowerCase().includes(term) ||
      user?.emailid?.toLowerCase().includes(term)
    );
  });


  // Fixed filtering for "People With Access" section
 const getUsersWithAccess = () => {
  if (!currentUser || currentUser.length === 0) return [];

  const sharedIds = sharedRes?.shared_user_ids || [];
  const ownerId = String(sharedRes?.user_id);
  // console.log("sharedIds",sharedIds)
  // console.log("sharownerIdedIds",ownerId)

  return currentUser.filter((user) => {
    const id = String(user?.user_id);
    return id === ownerId || sharedIds.includes(id);
  });
};


  const usersWithAccess = getUsersWithAccess();



  const RemoveUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
  };

  const ClearAll = () => {
    setSelectedUsers([]);
  };

  const ClickUser = (id: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setSearchTerm("");
  };

  const SharedData = async (selectedUsers: any) => {
    const existing = sharedRes?.shared_user_ids || [];
    const combinedUsers = Array.from(new Set([...existing, ...selectedUsers]));

    setIsLoading(true);
    const payload = {
  id: Feed_id,
  share_type: "internal",
  shared_options: sharedOption,
  shared_user_ids: combinedUsers,
  type: gentalData,   
};

    try {
      const res= await requestApi(
        "post",
        `${tenant_id}/share/salesenablement/`,
        payload,
        "authService"
      );
      CancelShareData(false);
       toast({
      title: "Success",
      description: res?.message || "Shareable data generated",
      variant: "success",
    });
    } catch (error:any) {
      toast({
      title: "Error",
      description: error.res?.message || " Shareable data Failed!",
      variant: "error",
    });
    setIsLoading(false);
    } 
    finally {
      setIsLoading(false);
    }
  };

  const DeleteSharedUser = async (id: string) => {
    const updated = sharedRes?.shared_user_ids?.filter(
      (userId: string) => userId !== id
    );

    setSharedRes((prev: any) => ({
      ...prev,
      shared_user_ids: updated,
    }));
  };
  // if(sharedLoading)return <div className="flex items-center justify-center h-[100px] bg-gray-50">
  //               <div className="w-10 h-10 border-4 border-gray-300 border-t-[#7A5AF8] rounded-full animate-spin"></div>
  //             </div>

  const handleCopy = async () => {
  if (!sharedRes?.link) return;

  try {
    // Modern Clipboard API (HTTPS only)
    await navigator.clipboard.writeText(sharedRes.link);
    setCopied(true);
  } catch (err) {
    // Fallback for HTTP / blocked permissions
    const textArea = document.createElement("textarea");
    textArea.value = sharedRes.link;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setCopied(true);
  }

  setTimeout(() => setCopied(false), 1500);
};

const RouteToViewMeet=()=>{
  navigate(`/meeting-feed/MeetingViewed/${sharedRes?.share_id}`,
    {state:{selectedItem,}}
  )
}


// console.log("sharedRes",sharedRes);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-7 rounded-lg shadow-lg w-[600px] relative">
        <h3 className="flex font-light text-xl mb-3 text-gray-700 line-clamp-2">
          Share <strong className="font-bold">'{selectedItem?.ai_title}'</strong>
        </h3>

        {/* User selection input */}
        <div className="relative mb-3 " ref={dropdownRef}>
          <div className="flex flex-wrap items-center gap-1 border-2 border-gray-200 rounded-md px-2 py-1">
            {selectedUsers.map((id) => {
              const user = currentUser.find(
                (u) => u.user_id.toString() === id.toString()
              );
              return (
                <div
                  key={id}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm"
                >
                  {user ? user.username : "Unknown"}
                  <button
                    onClick={() => RemoveUser(id)}
                    className="text-xs text-red-500 ml-1"
                  >
                    <img src={Close} alt="" className="size-3"/>
                  </button>
                </div>
              );
            })}

            <input
              type="text"
              placeholder={
                selectedUsers.length > 0
                  ? ""
                  : "Add people from your Organization"
              }
              className="flex-1 border-none outline-none text-[15px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setValidUser(true)}
            />


            {selectedUsers.length > 0 && (
              <button
                onClick={ClearAll}
                className="text-xs text-gray-500 hover:text-red-500 ml-1"
              >
                Clear all
              </button>
            )}
          </div>

          {validUser && (
            <div className="absolute z-10 w-full bg-white rounded-md mt-1 max-h-[150px] overflow-y-auto shadow-md">
              {filteredUsers.length > 0 ? (
                filteredUsers
                  .filter((user: any) => !selectedUsers.includes(user?.user_id))
                  .map((user: any) => (
                    <div
                      key={user.user_id}
                      className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => ClickUser(user.user_id)}
                    >
                      <div className="h-[30px] w-[30px] bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {user?.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col text-sm">
                        <h5 className="text-gray-800">{user?.username}</h5>
                        <p className="text-gray-500">{user?.emailid}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center text-sm py-2">
                  No users found
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gray-200 rounded-2xl flex justify-center items-center">
             <img src={FileImg} alt="" className="size-4" />
            </div>
            <select
              className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer px-0 text-gray-600"
              value={sharedOption}
              onChange={(e) => setSharedOption(e.target.value)}
            >
              <option value="all" className="text-gray-600 text-[13px]">
                All Content
              </option>
              <option value="audio" className="text-gray-600 text-[13px]">
                Audio Only
              </option>
              <option value="transcript" className="text-gray-600 text-[13px]">
                Transcript Only
              </option>
            </select>
          </div>
          {userInfo?.user_id === sharedRes?.user_id && (
          <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
         onClick={RouteToViewMeet} >
            <img src={PreviewIcon} alt="Preview" className="w-4 h-4" />
            <span>See who Viewed my Meeting</span>
          </div>
          )}
        </div>

        {/* Fixed People With Access section */}
        <div className="mb-3">
          <h5 className="text-gray-600 mb-2">People With Access</h5>
          <div className="h-[135px] overflow-y-scroll">

          {usersWithAccess.length > 0 ? (
            <div className="h-[125px] overflow-y-auto rounded-md">
              {[...usersWithAccess].sort((a, b) => {
                if (a?.user_id === sharedRes?.user_id) return -1;
                if (b?.user_id === sharedRes?.user_id) return 1;
                return 0;
              }).map((user, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center gap-1 py-1 px-2 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-[30px] w-[30px] bg-gray-200 rounded-full flex items-center justify-center">
                      {user?.username?.[0]?.toUpperCase()}
                    </span>
                    <div>
                      <h5 className="text-gray-600 text-sm">
                        {user?.username}
                      </h5>
                      <p className="text-gray-500 text-xs">{user?.emailid}</p>
                    </div>
                  </div>

                  {user?.user_id === sharedRes?.user_id ? (
                    <span className="text-xs font-semibold text-blue-600">
                      Owner
                    </span>
                  ) : (
                    <span
                      className="text-xs font-semibold text-red-600 cursor-pointer hover:text-red-700"
                      onClick={() => DeleteSharedUser(user.user_id)}
                    >
                      Remove
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[100px] bg-gray-50">
                 <div className="w-10 h-10 border-4 border-gray-300 border-t-[#7A5AF8] rounded-full animate-spin"></div>
              </div>
          )}
          </div>

        </div>

        {/* Rest of your component remains the same */}
        <div className="relative mb-4 w-[60%]">
          <div className="flex items-start gap-2">

          {
         gentalData ? ( gentalData === "private"
             ? <img src={Locked} alt="Locked"/>
             : <img src={LockOpen} alt="LockOpen"/>)
            : null
        }

            <div>
              <p className="text-gray-600 text-sm">{gentalData === "private" ? "Restricted" : "Anyone with the link"}</p>


              <p className="text-xs text-gray-500">
                Only people with access can open with the link
              </p>
            </div>
          </div>
          <img
            src={UpArrow}
            alt="dropdown"
            className="absolute right-0 top-0 cursor-pointer"
            onClick={(e)=>{
              e.stopPropagation();
              setGentalClick(gentalClick == 0 ? null : 0);
            }}
          />
         {gentalClick === 0 && (
  <div className="absolute top-8 right-0 bg-white border shadow-md rounded-md p-2 w-[200px] text-sm font-medium border-gray-400 focus:outline-none cursor-pointer">

    <p
  className={`px-2 py-1 rounded cursor-pointer 
    ${gentalData === "private" ? "bg-blue-300" : "hover:bg-blue-200"}`}
  onClick={() => setGentalData("private")}
>
  Restricted
</p>

<p
  className={`px-2 py-1 rounded cursor-pointer 
    ${gentalData === "public" ? "bg-blue-300" : "hover:bg-blue-200"}`}
  onClick={() => setGentalData("public")}
>
  Anyone with the link
</p>
  </div>
)}

        </div>

        <div className="flex justify-between items-center mt-4">
         <div className="relative">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm text-gray-800 hover:text-blue-600 transition"
          >


              <img src={CopyIcon} alt=""  className={`transition-transform size-4 ${copied ? "scale-125" : ""}`} />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
                    </button>

            {copied && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-md shadow-md opacity-0 animate-fadein">
                Link Copied!
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              className="px-6 py-2 text-gray-500 hover:bg-gray-50 rounded-md text-sm font-medium"
              onClick={() => CancelShareData(false)}
            >
              {userInfo?.user_id === sharedRes?.user_id ? 'Cancel' : 'Close'}
            </button>
            {userInfo?.user_id === sharedRes?.user_id && (
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                onClick={() => SharedData(selectedUsers)}
              >
                {IsLoading ? 'Loading...' : 'Done'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareExport;