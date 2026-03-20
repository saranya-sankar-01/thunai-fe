import { useState, useEffect, useRef } from "react";
import { getLocalStorageItem , requestApi } from "../Service/MeetingService";
import FileImg from "../assets/svg/FileImg.svg";
import Close from "../assets/svg/Close.svg";

import Locked from "../assets/svg/Locked.svg";
import LockOpen from "../assets/svg/LockOpen.svg";
import UpArrow from "../assets/svg/Keyboard_arrow_down1.svg";

const userInfo = getLocalStorageItem("user_info") || {};
const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

interface ShareExportProps {
  setShareMeeting: (status: boolean) => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
}

const MeetingShare: React.FC<ShareExportProps> = ({
  setShareMeeting,
  selectedItems,
  setSelectedItems,
}) => {
  const [currentUser, setCurrentUser] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sharedOption, setSharedOption] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [gentalData, setGentalData] = useState("private");
   const [gentalClick, setGentalClick]=useState<number| null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const FetchUser = async () => {
    const payload = {
      filter: [],
      page: { size: 100, page_number: 1 },
      size: 5,
      sort: "dsc",
    };

    try {
      const response = await requestApi(
        "post",
        `${tenant_id}/users/`,
        payload,
        "accountService"
      );

      const usersData = response?.data?.data;
      setCurrentUser(Array.isArray(usersData) ? usersData : usersData ? [usersData] : []);
    } catch (error) {
      console.error("FetchUser error:", error);
      setCurrentUser([]);
    }
  };

  useEffect(() => {
    FetchUser();
  }, []);

  const filteredUsers = currentUser.filter((user: any) =>
    user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
  };

  const clearAllUsers = () => setSelectedUsers([]);

  const clickUser = (id: string) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSearchTerm("");
    setOpenDropdown(false);
  };

  const shareData = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const payload = {
      ids: selectedItems,
      share_type: "internal",
      shared_options: sharedOption,
      shared_user_ids: selectedUsers,
      type:gentalData
    };

    try {
      await requestApi(
        "post",
        `${tenant_id}/share/salesenablement/`,
        payload,
        "authService"
      );
      setShareMeeting(false);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelMeet = () => setShareMeeting(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(()=>{
  const CloseMouse=()=>setGentalClick(null);
  document.addEventListener("click",CloseMouse)

  return ()=> document.removeEventListener("click",CloseMouse);
},[])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className=" bg-white p-5 rounded-lg shadow-lg h-[300px] w-[550px] relative">
        <h3 className="font-light text-xl mb-3">Share</h3>

        <div className="relative mb-3" ref={dropdownRef}>
          <div className="flex flex-wrap items-center gap-1 border-2 border-gray-200 rounded-md px-2 py-1">
            {selectedUsers.map((id) => {
              const user = currentUser.find((u) => String(u.user_id) === String(id));
              return (
                <div
                  key={id}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm"
                >
                  {user ? user.username : "Unknown"}
                  <button onClick={() => removeUser(id)}>
                    <img src={Close} alt="" className="size-3" />
                  </button>
                </div>
              );
            })}

            <input
              type="text"
              placeholder={selectedUsers.length ? "" : "Add people from your Organization"}
              className="flex-1 border-none outline-none text-[15px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setOpenDropdown(true)}
            />

            {selectedUsers.length > 0 && (
              <button onClick={clearAllUsers} className="text-xs text-gray-500 hover:text-red-500 ml-1">
                Clear all
              </button>
            )}
          </div>

          {openDropdown && (
            <div className="absolute z-10 w-full bg-white rounded-md mt-1 max-h-[150px] overflow-y-auto shadow-md">
              {filteredUsers.length ? (
                filteredUsers
                  .filter((user: any) => !selectedUsers.includes(String(user.user_id)))
                  .map((user: any) => (
                    <div
                      key={user.user_id}
                      className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => clickUser(String(user.user_id))}
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
                <p className="text-gray-500 text-center text-sm py-2">No users found</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="size-8 bg-gray-200 rounded-2xl flex justify-center items-center">
            <img src={FileImg} alt="" className="size-4" />
          </div>
          <select
            className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer text-gray-600"
            value={sharedOption}
            onChange={(e) => setSharedOption(e.target.value)}
          >
            <option value="all">All Content</option>
            <option value="audio">Audio Only</option>
            <option value="transcript">Transcript Only</option>
          </select>
        </div>

         <div className="relative mb-4 w-[60%]">
          <div className="flex items-start gap-2">

          {
         gentalData ? ( gentalData === "private"
             ? <img src={Locked} alt="Locked"/>
             : <img src={LockOpen} alt="LockOpen"/>)
            : null
        }

            <div>
              <p className="font-semibold text-sm">{gentalData === "private" ? "Restricted" : "Anyone with the link"}</p>


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

        <div className="flex justify-end gap-2 absolute bottom-5 right-7">
          <button className="bg-gray-500 text-white px-3 py-2 rounded" onClick={cancelMeet}>
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded disabled:opacity-50"
            onClick={shareData}
           disabled={isLoading || selectedUsers?.length === 0}
          >
            {isLoading ? "Sending..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingShare;
