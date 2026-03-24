import { useState, useEffect } from "react";
import { FetchParameter } from "../../features/CallAnalysiSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";

import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {getLocalStorageItem, requestApi } from "@/services/authService";

import Check2 from "../../assets/svg/Check2.svg";
import DeleteImg from "../../assets/svg/Delete.svg";
import Add from "../../assets/svg/Add2.svg";

const url = new URL(window.location.href);
// const tenant_id =url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");
 const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");


interface Parameter {
  id?: number | string;
  params: string;
  instruction: string;
  custom?: boolean;
}


interface ParametersListProps {
  onAddConfiguration: (parameters: Parameter[]) => void;
  selectedParameters: Parameter[];
   mode?: "view" | "edit"; 
}

const ParametersList = ({
  onAddConfiguration,
  selectedParameters,
  mode,
}: ParametersListProps) => {
  const [selectedParams, setSelectedParams] = useState<string[]>([]);


  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useAppDispatch();

  const { ParameterDetails, loading, error } = useAppSelector((state: any) => state.Parameter);

  useEffect(() => {
    dispatch(FetchParameter());
  }, [dispatch]);

  useEffect(() => {
    const paramNames = selectedParameters.map((param) => param.params);
    setSelectedParams(paramNames);
  }, [selectedParameters]);

  const parameterList: Parameter[] =ParameterDetails?.data?.parameters?.parameters || [];

  const filteredParameters = parameterList.filter((data) =>
    data.params?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // console.log("filteredParameters",filteredParameters);

  const handleAddConfiguration = () => {
    const selectedItems = parameterList.filter((item) =>
      selectedParams.includes(item.params)
    );
    onAddConfiguration(selectedItems);
  };

  const toggleSelect = (paramName: string) => {
    setSelectedParams((prev) =>
      prev.includes(paramName)
        ? prev.filter((item) => item !== paramName)
        : [...prev, paramName]
    );
  };

 const ParamsDelete = async (item: any) => {
  try {
    const res = await requestApi(
      "DELETE",
      `${tenant_id}/customise/call/scoring/?id=${item.id}`,
      {},
      "authService",
    );
    toast.success(res?.message);
  
    // Remove from selected list
    setSelectedParams((prev) =>
      prev.filter((param) => param !== item.params)
    );

    //  Re-fetch updated list
    dispatch(FetchParameter());

  } catch (err: any) {
    const errorMessage = err?.message ||
      err?.response?.data?.message ||
      "Delete failed!";

    toast.error(errorMessage);
  }
};



  return (
    <div className="px-2 space-y-4 overflow-y-scroll h-[77vh] scrollbar-thin">
      <h6 className="font-semibold text-gray-700">
        Default Scoring ({parameterList.length})
      </h6>

      <div>
        <p className="text-sm text-gray-600 mb-1">Search Parameters</p>
        <input
          type="text"
          placeholder="Search Params here"
          className={
            `border border-gray-400 p-2 w-full rounded outline-none focus:ring-2 focus:ring-blue-400  
  ${mode === "view"
    ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
    : "bg-white hover:bg-gray-50"}`
          }
          value={searchTerm}
          disabled={ mode === "view"}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-700">
          {selectedParams.length} Parameter(s) Selected
        </p>
        <button
          onClick={handleAddConfiguration}
          className={`flex items-center gap-2 px-2 py-2 lg:px-3 lg:py-2 text-[12px] lg:text-[15px] rounded-lg transition-colors ${
            selectedParams.length === 0 || mode==="view"
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={selectedParams.length === 0 || mode === "view"}
        >
          <img
            src={Add}
            alt="add"
            className="size-4 lg:size-7"

          />
          Add Configuration
        </button>
      </div>

      {
        loading? (<div className="flex items-center justify-center h-[100px] bg-gray-50">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-[#7A5AF8] rounded-full animate-spin"></div>
              </div>): error ?( <div>{error} </div> ) :(

      <div className="space-y-3">
        {filteredParameters.length > 0 ? (
          filteredParameters.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between items-center border border-gray-300 p-3 rounded cursor-pointer transition-colors ${
                selectedParams.includes(item.params)
                  ? "bg-blue-50 border-blue-300"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
             if (mode === "view") return;
                toggleSelect(item.params);
              }}

            >
              <div className="flex-1">
                <h6 className="font-medium text-gray-800">{item.params}</h6>
                <p className="text-sm text-gray-600 mt-1">{item.instruction}</p>
              </div>
              <div className="flex items-center gap-3">
  {selectedParams.includes(item.params) && (
    <div className="w-6 h-6 bg-blue-600 rounded-full flex justify-center items-center">
      <img src={Check2} alt="checked" className="w-3 h-3" />
    </div>
  )}

  <span>
    {item.custom === false ? (
      <span className="text-blue-600 font-semibold text-sm">
        Default
      </span>
    ) : (
      <div className="bg-red-50 rounded-sm p-1">
      <img
  src={DeleteImg}
  onClick={(e) => {
  e.stopPropagation();
  if (mode === "view") return;
  ParamsDelete(item);
}}

  alt="Delete"
  className="size-4 cursor-pointer "
/>
      </div>
    )}
  </span>
</div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm mt-4">
            No matching parameters found.
          </p>
        )}
      </div>  )
      }


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
    </div>
  );
};

export default ParametersList;
