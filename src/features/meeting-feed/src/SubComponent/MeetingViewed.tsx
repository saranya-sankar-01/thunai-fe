import { useEffect, useState } from "react";
import {  useLocation } from "react-router-dom";
import { getLocalStorageItem ,requestApi } from "@/services/authService";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Calendar, Share2, Eye } from "lucide-react";
import LoadingComp from "./ReuseComponent/LoadingComp";

interface ViewItem {
  company_name: string | null;
  user: {
    emailid: string;
    username: string;
  };
  page_details: {
    title: string;
  };
  created: string;
}

const MeetingViewed = () => {
  // const [searchParams] = useSearchParams();
  // const params = useParams();
  const location = useLocation();
  const selectedItem: any = location.state;
  const userInfo = getLocalStorageItem("user_info") || {};
  const Feed_id = userInfo?.profile?.user_id;
  
  // const Feed_id = searchParams.get("id") || params.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [viewData, setViewData] = useState<ViewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  useEffect(() => {
    const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

    const fetchViewData = async () => {
      if (!tenant_id || !Feed_id) return;

      setIsLoading(true);
      try {
        const response = await requestApi(
          "POST",
          `${tenant_id}/views/filter/`,
          {
            limit,
            share_id: Feed_id,
            page,
          },
          "authService"
        );

        const responseData = response?.data?.data;
        console.log("Meeting Viewed Response:", responseData);
        setViewData(responseData ?? []);
        setTotal(responseData?.total ?? 0);
      } catch (err) {
        console.error("Error fetching meeting viewed data:", err);
        setViewData([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchViewData();
  }, [Feed_id, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>
    <div className="border flex justify-between items-center border-blue-200 rounded-xl bg-white p-6 mb-8 shadow-sm">

<div>

      <h1 className="text-xl font-medium text-gray-900 mb-2">
        {selectedItem?.selectedItem?.title || viewData[0]?.page_details?.title}
      </h1>


      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-2">

        <div className="flex items-center gap-2">
          <Calendar size={16} />
          Created:{" "}
          {selectedItem?.selectedItem?.created
            ? format(new Date(selectedItem.selectedItem.created), "MMM dd, yyyy")
            : "-"}
        </div>

        <div className="flex items-center gap-2">
          <Share2 size={16} />
          Share ID: {Feed_id}
        </div>

        <div className="flex items-center gap-2">
          <Eye size={16} />
          Total Views: {viewData.length}
        </div>
      </div>
</div>
<div>
            <button className="px-2 py-1 text-xs bg-indigo-50 text-blue-600 rounded-lg transition">Shared</button>
</div>

    </div>

<div className="bg-white rounded-xl border border-gray-200 shadow-sm">

  <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr] border-b bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    <div>Viewer</div>
    <div>Document</div>
    <div>Company</div>
    <div>Viewed On</div>
  </div>

  <div className="max-h-[420px] overflow-y-auto">

    {isLoading ? (
      <LoadingComp Color="#7A5AF8" height="400px"/>
    ) : viewData.length === 0 ? (
      <div className="p-8 h-[300px] text-center text-gray-500">
        No views found
      </div>
    ) : (
      viewData.map((item, index) => (
        <div
          key={index}
          className="border-b last:border-none hover:bg-gray-50 transition"
        >
          <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr] px-8 py-6 items-center">

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                {item.user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.user?.username}
                </p>
                <p className="text-sm text-gray-500">
                  {item.user?.emailid}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-900 max-w-md truncate"> 
              {item.page_details?.title}
            </div>

            <div className="text-gray-600">
              {item.company_name || "Not specified"}
            </div>

            <div className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(item.created), {
                addSuffix: true,
              })}
            </div>
          </div>


          <div className="md:hidden p-5 space-y-3">

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                {item.user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {item.user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {item.user?.emailid}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Document</p>
              <p className="text-sm text-gray-900 max-w-md truncate">
                {item.page_details?.title}
              </p>
            </div>

            <div className="flex justify-between text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase">Company</p>
                <p className="text-sm text-gray-900">
                  {item.company_name || "Not specified"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase">Viewed</p>
                <p className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(item.created), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

          </div>

        </div>
      ))
    )}
  </div>
</div>


      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-8">

          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="text-gray-500 hover:text-gray-800 disabled:text-gray-300"
          >
            Previous
          </button>

          <span className="h-10 w-10 flex items-center justify-center bg-indigo-600 text-white rounded-lg">
            {page}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="text-gray-500 hover:text-gray-800 disabled:text-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingViewed;
