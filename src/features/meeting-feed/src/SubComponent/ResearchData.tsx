import { useEffect, useState ,useRef} from "react";
import { useNavigate } from "react-router-dom";
import {getLocalStorageItem , requestApi } from "@/services/authService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Skeleton from "../components/Skeleton";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

import BackArrow from "../assets/svg/Arrow_back.svg";
import FileImg from "../assets/svg/FileImg.svg";

import CopyIcon from "../assets/svg/CopyIcon.svg";
import Locked from "../assets/svg/Locked.svg";
import LockOpen from "../assets/svg/LockOpen.svg";

import KeyArrow2 from "../assets/svg/Keyboard_arrow.svg";
import Close from "../assets/svg/Close.svg";
import DeleteImg from "../assets/svg/Delete.svg";
import UpArrow from "../assets/svg/Keyboard_arrow_down1.svg";
import SendButton from "../assets/svg/SendButton.svg";




const ResearchData = () => {
  const url = new URL(window.location.href);
  const userInfo = getLocalStorageItem("user_info") || {};
  const Feed_id = url.searchParams.get("id") || userInfo?.profile?.user_id;
  
  const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");




  const [researchValue, setResearchValue] = useState<any>(null);
  const navigate = useNavigate();
  
  const[IsLoading,setIsLoading]=useState<boolean>(false);
  const [showShare, setShowShare]=useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleBack = () => navigate(-1);


  const [sharedRes, setSharedRes] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<any[]>([]);
 
  const [validUser, setValidUser] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [sharedOption, setSharedOption] = useState("all");

  const [gentalClick, setGentalClick]=useState<number| null>(null);

  const [gentalData, setGentalData] = useState("private");
  const IS_SHOW_AI_CREDITS = import.meta.env.VITE_IS_SHOW_AI_CREDITS || ((window as any)?.env?.IS_SHOW_AI_CREDITS ?? true)

  useEffect(() => {
    const fetchResearchDetails = async () => {
      if (!tenant_id || !Feed_id) {
        console.error("Missing tenant_id or UserId");
        return;
      }

      try {
        const payload = {
          filter: [],
          page: { size: 10, page_number: 1 },
          sort: "desc",
          sortby: "created",
        };

        const response = await requestApi(
          "POST",
          `${tenant_id}/research/calls/${Feed_id}/`,
          payload,
          "authService"
        );

        // console.log("response rep",response)

       const researchData = response?.resdata?.data[0] ??
              response?.resdata?.[0] ??
              null;
              // console.log("inside researchData",researchData);
          setResearchValue(researchData);

      } catch (error) {
        console.error("Error fetching research details:", error);
      }
    };

    fetchResearchDetails();
  }, [tenant_id, Feed_id]);

  // console.log("researchValue",researchValue);

const SendBrainData = async () => {

 const payload = {
  user_id: researchValue?.user_id ?? null,
  added_type: "research",
  ai_title: researchValue?.ai_title ?? null,
  title: researchValue?.title ?? researchValue?.prompt ?? null,
  summary: researchValue?.summary ?? researchValue?.results ?? null,
  callscore_flag: researchValue?.callscore_flag ?? false,
  call_scores: researchValue?.call_scores ?? [],
  category: researchValue?.category ?? null,
  chapters_and_topics: researchValue?.chapters_and_topics ?? [],
  cloud_storage_file_path: researchValue?.cloud_storage_file_path ?? null,
  credits: researchValue?.credits ?? 0,
  diarize_enabled: researchValue?.diarize_enabled ?? false,
  field_download_response: researchValue?.field_download_response ?? [],
  field_mapping_data: researchValue?.field_mapping_data ?? null,
  file_name: researchValue?.file_name ?? null,
  id: researchValue?.id ?? null,
  invited_participants: researchValue?.invited_participants ?? [],
  joined_participants: researchValue?.joined_participants ?? [],
  key_points: researchValue?.key_points ?? [],
  link_type: researchValue?.link_type ?? "public",
  linked_apps: researchValue?.linked_apps ?? [],
  meeting_date: researchValue?.meeting_date ?? new Date().toISOString(),
  next_steps: researchValue?.next_steps ?? [],
  result_data: researchValue?.result_data ?? [],
  schedule_id: researchValue?.schedule_id ?? null,
  schedule_unique_id: researchValue?.schedule_unique_id ?? null,
  sentiment_percentage: researchValue?.sentiment_percentage ?? {},
  sentiment_reasoning: researchValue?.sentiment_reasoning ?? [],
  sentiment_transcription_with_timing:
    researchValue?.sentiment_transcription_with_timing ?? [],
  shared_options: researchValue?.shared_options ?? "all",
  shared_share_type: researchValue?.shared_share_type ?? null,
  shared_user_ids: researchValue?.shared_user_ids ?? [],
  speaker_talktime: researchValue?.speaker_talktime ?? [],
  status: researchValue?.status ?? "done",
  synced_from: researchValue?.synced_from ?? null,
  transcription_with_timing:
    researchValue?.transcription_with_timing ?? [],
};
  try {
    setIsLoading(true);
    const response = await requestApi(
      "POST",
      `${tenant_id}/add-to/knowledgebase/`,
      payload,
      "authService"
    );

    toast.success(response?.message || response?.message || "Text data added to the Brain successfully!");

  }  catch (err: any) {
    const errorMessage = err?.message ||
      err?.response?.message ||
      "Text data already exists in the Brain!";

      setIsLoading(false);
    toast.error(errorMessage);
  }finally{
        setIsLoading(false);
      }
};

 useEffect(() => {
    const closeMouseShare = () => setActiveIndex(null);
    document.addEventListener("click", closeMouseShare);
    return () => document.removeEventListener("click", closeMouseShare);
  }, []);
 useEffect(() => {
    const closeMouseShare = () => setGentalClick(null);
    document.addEventListener("click", closeMouseShare);
    return () => document.removeEventListener("click", closeMouseShare);
  }, []);


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
    // ShareData();
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
  share_type: "external",
  shared_options: sharedOption,
  shared_user_ids: combinedUsers,
  type: gentalData,   
};

    try {
      await requestApi(
        "post",
        `${tenant_id}/share/salesenablement/`,
        payload,
        "authService"
      );
      setShowShare(false);
    } catch (error) {
      console.error("error from sharedData", error);
      setIsLoading(false);
    } finally {
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
  const CancelShareData =()=>{
    setShowShare(false);
    setSelectedUsers([]);
    setSearchTerm("");
  }

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

  return (
    <div className="px-5 py-2 max-h-[calc(100vh)] overflow-y-scroll scrollbar-thin">
      <div className="flex justify-between items-center py-4 px-2 flex-wrap gap-3">
        <div
          className="flex gap-1 cursor-pointer text-black font-semibold"
          onClick={handleBack}
        >
          <img
            src={BackArrow}
            className="mt-0.5"
            alt="Back"
          />
          <span className="text-md text-[#0c51db]">Back</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="bg-[#2d2f92] hover:bg-[#191a6c] flex items-center gap-1 text-white h-[40px] rounded-lg px-1 sm:px-4 py-2 hover:opacity-90 transition cursor-pointer"
          onClick={SendBrainData}>
            <span className="h-[20px] text-md">{IsLoading ? "Adding...": "Add to Brain"}</span>
          </button>


          <button className="relative flex items-center bg-[#2d2f92] hover:bg-[#191a6c] rounded-lg h-9 px-3 transition cursor-pointer"
          onClick={(e)=>{
            e.stopPropagation();
            setActiveIndex(activeIndex === 0 ? null : 0);
                   }}>
            <span className="h-[20px] mb-0.5 text-[#FFFFFF] text-md font-medium">
              Share
            </span>
            <span className="pl-2 ml-3 border-l-2 border-white flex items-center h-full">
              <img
                src={KeyArrow2}
                alt="KeyArrow2"
                className="ml-1 h-[20px] w-[20px]"
              />
            </span>
          </button>
        </div>
      </div>

      <h4 className="font-semibold text-lg mb-2">Research Result</h4>

      <div className="p-4 bg-gray-50 rounded-lg shadow-2xl min-h-[75vh] overflow-y-auto ">
        {researchValue ? (
          <div className="prose max-w-none text-gray-800 leading-relaxed">
            <div className="flex justify-between items-start flex-wrap gap-2 mb-4 border-b-2 border-gray-200 pb-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {researchValue?.prompt || "Untitled Research"}
                </h1>
                <p className="text-sm text-gray-500">
                  Researched by:{" "}
                  <span className="font-medium text-gray-700">
                    {researchValue?.uploaded_by || "Unknown"}
                  </span>
                </p>
              </div>
              
              {
                IS_SHOW_AI_CREDITS &&(
                <button className="py-2 px-4 bg-blue-100 text-[#2F45FF] font-medium rounded-2xl text-sm hover:bg-blue-200 transition">
                    AI Credits:{researchValue?.credits ?? "—"}
                </button>
                )
              }
            </div>

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mb-2 mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mb-2 mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold mb-1 mt-0">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                code: ({ className, children }: any) => {
                  const isInline = !className?.includes("language-");
                  return isInline ? (
                    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                      <code className="text-xs font-mono">{children}</code>
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-accent pl-4 italic my-2">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-accent underline hover:text-accent/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="border-border my-4" />,
              }}
            >
              {researchValue?.results || "No research history available."}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        )}
      </div>
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mr-20"
      />

      {activeIndex === 0 && (
        <div className="flex gap-1 absolute top-16 right-5 bg-white border border-gray-300 shadow-lg rounded-md p-2 w-30 z-50  hover:bg-gray-100 hover:text-blue-700"
        onClick={()=>{
          ShareData();
          setShowShare(true)
        }}
        >
          <img src={SendButton} alt="" className="size-5 mb-0.5"
                          style={{ transform: "rotate(310deg)" }} />
          <span className="font-medium text-gray-700 cursor-pointer" 
          > Share</span>
        </div>
         )}

      {showShare && (
      
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-7 rounded-lg shadow-lg w-[600px] relative">
        <h3 className="font-light text-xl mb-3 text-gray-700 line-clamp-2">
      {/* <img src={} alt="Arrow" />  */}
      
       Share <strong className="font-bold">'{researchValue?.prompt}'</strong>
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
        </div>

        {/* Fixed People With Access section */}
        <div className="mb-3">
          <h5 className="font-semibold mb-2">People With Access</h5>
          <div className="h-[135px] overflow-y-scroll">

          {usersWithAccess.length > 0 ? (
            <div className="h-[125px] overflow-y-auto rounded-md">
              {usersWithAccess.map((user, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center gap-1 py-1 px-2 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-[30px] w-[30px] bg-gray-200 rounded-full flex items-center justify-center">
                      {user?.username?.[0]?.toUpperCase()}
                    </span>
                    <div>
                      <h5 className="font-semibold text-sm">
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
                    <img
                      src={DeleteImg}
                      alt="delete"
                      className="cursor-pointer h-4"
                      onClick={() => DeleteSharedUser(user.user_id)}
                    />
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
         gentalData
              ? (gentalData === "private"
             ? <img src={Locked} alt="Locked"/>
             : <img src={LockOpen} alt="LockOpen"/>)
            : null
             }

            <div>
              <p className="font-semibold text-sm">{gentalData === "private" ?"Restricted":"Anyone with the Link"}</p>


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
              onClick={CancelShareData}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              onClick={() => SharedData(selectedUsers)}
            >
              {IsLoading ? "Sending..." : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  
      )}

    </div>
  );
};

export default ResearchData;
