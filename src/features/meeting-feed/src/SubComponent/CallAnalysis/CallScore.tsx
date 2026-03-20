import { useEffect, useState, useRef } from "react";
import { FetchMappingApi, FetchAllScore } from "../../features/CallAnalysiSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { useNavigate } from "react-router-dom";
import { getLocalStorageItem ,requestApi } from "../../Service/MeetingService";

// const url = new URL(window.location.href);
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MoreVert from "../../assets/svg/More_vert.svg";
import BackArrow from "../../assets/svg/Arrow_back.svg";
import AddIcon from "../../assets/svg/Add2.svg";
import CheckIcon from "../../assets/svg/Check.svg";
import DeleteImg from "../../assets/svg/Delete.svg";
import EditImg from "../../assets/svg/Edit.svg";


interface GroupItem {
  params_group_name: string;
  [key: string]: any;
}

interface FieldMapping {
  field_name: string;
  field_referred_from: string;
}

interface CustomFieldItem {
  config_id?: string;
  field_mappings?: FieldMapping[];
  field_name?: string;
  field_referred_from?: string;
}



// interface CustomFieldItem {
//   config_id?: string;
//   field_name: string;
//   field_referred_from: string;
//   fields?: Array<{
//     field_name: string;
//     field_referred_from: string;
//   }>;
// }

const CallScore = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [enable, setEnable] = useState(false);
  const [showUpdates, setShowUpdates] = useState<number | null>(null);
  
  const allScoreState = useAppSelector((state: any) => state.allScore);
  const { AllScoreDetails } = allScoreState;
  
  // Create-field states
  const [fieldName, setFieldName] = useState("");
  const [instruction, setInstruction] = useState("");
  const [fields, setFields] = useState<{ field: string; instruction: string }[]>([
    { field: "", instruction: "" },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oldFieldName, setOldFieldName] = useState("");
  const [showGroup, setShowGroup] = useState<number | null>(null);

  // Custom-field states
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
  const [customField, setCustomField] = useState<CustomFieldItem[]>([]);
  const [fieldTap, setFieldTap] = useState<string>("Create-field");
  const [customFieldLoading, setCustomFieldLoading] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<CustomFieldItem | null>(null);
  const [showField, setShowField] = useState<number | null>(null);

  // Form state for custom field
  const [customFieldForm, setCustomFieldForm] = useState<{
    field_name: string;
    field_referred_from: string;
    selected_score_field: string;
  }>({
    field_name: "",
    field_referred_from: "",
    selected_score_field: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  // const customFieldOptionsRef = useRef<HTMLDivElement>(null);

// Replace the useEffect with this updated version
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowGroup(null);
    }
  };

  const handleClickOutsideField = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isDropdownButton = target.closest('.more-vert-button');
    const isDropdownMenu = target.closest('.dropdown-menu');
    
    if (!isDropdownButton && !isDropdownMenu) {
      setShowField(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("mousedown", handleClickOutsideField);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("mousedown", handleClickOutsideField);
  };
}, []);

  const mappingState = useAppSelector((state: any) => state.mapping);
  const { MappingDetails } = mappingState;

   const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || localStorage.getItem("tenant_id");

  // Check for duplicate custom field
 const isDuplicateCustomField = (
  fieldName: string,
  fieldReferredFrom: string
): boolean => {
  if (!Array.isArray(customField)) return false;

  return customField.some((item: any) => {
    //  Case 1: API returns field_mappings array
    if (Array.isArray(item.field_mappings)) {
      const matchInMappings = item.field_mappings.some((field: any) =>
        field.field_name === fieldName &&
        field.field_referred_from === fieldReferredFrom
      );
      if (matchInMappings) return true;
    }

    //  Case 2: API returns flat object
    if (
      typeof item.field_name === "string" &&
      typeof item.field_referred_from === "string"
    ) {
      if (
        item.field_name === fieldName &&
        item.field_referred_from === fieldReferredFrom
      ) {
        return true;
      }
    }

    return false;
  });
};


  // Fetch custom fields
  const fetchCustomFields = async () => {
    try {
      const response = await requestApi(
        "GET",
        `${tenant_id}/custom/field/mappings/`,
        {},
        "authService"
      );
       const mappings = response?.data?.field_mappings || response?.data || [];
       setCustomField(Array.isArray(mappings) ? mappings : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch custom fields");
    }
  };

  useEffect(() => {
    dispatch(FetchMappingApi());
    dispatch(FetchAllScore());
    fetchCustomFields();
  }, [dispatch, tenant_id]);

  // Add this function to check if a group is already used as a custom field
const isGroupAlreadyUsed = (groupName: string): boolean => {
  if (!Array.isArray(customField)) return false;
  
  // Normalize the group name to match the format stored in custom fields
  const normalizedGroupName = groupName.replace(/\s+/g, '_').toLowerCase();
  
  return getAllFieldMappings().some((field: any) => {
    // Check if this is a call_scoring field and the field name matches the normalized group name
    return field.field_referred_from === "call_scoring" && 
           field.field_name?.toLowerCase() === normalizedGroupName;
  });
};

  useEffect(() => {
    if (MappingDetails?.data) {
      setEnable(MappingDetails.data.enable);
    }
  }, [MappingDetails]);


  // Update handleGroupSelect to check for duplicates
const handleGroupSelect = (group: GroupItem) => {
  // Check if this group is already used (and we're not editing this same group)
  if (!editingCustomField && group?.params_group_name) {
    const isUsed = isGroupAlreadyUsed(group.params_group_name);
    
    if (isUsed) {
      toast.error("This group is already used as a custom field. Please select a different group.");
      return;
    }
  }
  
  setSelectedGroup(group);
  setShowGroup(null);
  
  // Auto-fill field name based on group name
  if (group?.params_group_name) {
    const fieldName = group.params_group_name.replace(/\s+/g, '_').toLowerCase();
    setCustomFieldForm(prev => ({
      ...prev,
      field_name: fieldName,
      field_referred_from: "call_scoring",
      selected_score_field: group.params_group_name
    }));
  }
};

  // Reset custom field form
  const resetCustomFieldForm = () => {
    setCustomFieldForm({
      field_name: "",
      field_referred_from: "",
      selected_score_field: "",
    });
    setSelectedGroup(null);
    setEditingCustomField(null);
  };

  // Save custom field
  const saveCustomField = async () => {
    const { field_name, field_referred_from } = customFieldForm;
    
    if (!field_name.trim() || !field_referred_from.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for duplicate
    if (!editingCustomField && isDuplicateCustomField(field_name, field_referred_from)) {
      toast.error("A custom field with this name and source already exists");
      return;
    }

    const payload = {
      enable: true,
      fields: [
        ...customField,
        {
          field_name: field_name.trim(),
          field_referred_from: field_referred_from.trim()
        }
      ]
    };

    try {
      setCustomFieldLoading(true);
      
      if (editingCustomField) {
        // Update existing field
        const response = await requestApi(
          "POST",
          `${tenant_id}/custom/field/mappings/`,
          payload,
          "authService"
        );
        toast.success(response?.data?.message|| "Custom field updated successfully!" );
      } else {
        // Create new field
       const response = await requestApi(
          "POST",
          `${tenant_id}/custom/field/mappings/`,
          payload,
          "authService"
        );
        toast.success( response?.data?.message || "Custom field saved successfully!");
      }
      
      resetCustomFieldForm();
      fetchCustomFields();
    } catch (err: any) {
      console.error("Error saving custom field:", err);
      toast.error(err?.response?.data?.message|| err?.response?.message || "Failed to save custom field");
    } finally {
      setCustomFieldLoading(false);
    }
  };

  // Delete custom field
 // Update the handleDeleteCustomField function
const handleDeleteCustomField = async (item: any) => {
  // Close the dropdown
  setShowField(null);
  
  // Confirm deletion
  // if (!window.confirm('Are you sure you want to delete this custom field?')) {
  //   return;
  // }
  
  // Get the field name and source from the item
  const fieldData = item.field_mappings?.[0] || item;
  const fieldName = fieldData.field_name;
  const fieldReferredFrom = fieldData.field_referred_from;
  
  if (!fieldName || !fieldReferredFrom) {
    toast.error("Invalid field data");
    return;
  }
  
  try {
    setCustomFieldLoading(true);
    
    // Filter out the item to delete
    const remainingFields = customField.filter((field: any) => {
      if (Array.isArray(field.field_mappings)) {
        // Check if any mapping matches
        return !field.field_mappings.some((mapping: any) => 
          mapping.field_name === fieldName && 
          mapping.field_referred_from === fieldReferredFrom
        );
      } else {
        // Flat structure
        return !(field.field_name === fieldName && 
                 field.field_referred_from === fieldReferredFrom);
      }
    });
    
    // Prepare payload - need to send the entire updated array
    const payload = {
      custom_fields: remainingFields
    };
    
    await requestApi(
      "POST",
      `${tenant_id}/custom/field/mappings/`,
      payload,
      "authService"
    );
    
    toast.success("Custom field deleted successfully!");
    
    // Update local state
    setCustomField(remainingFields);
    
    // Reset form if editing the deleted item
    if (
      editingCustomField &&
      ((editingCustomField.field_mappings?.[0]?.field_name === fieldName) ||
       (editingCustomField.field_name === fieldName))
    ) {
      resetCustomFieldForm();
    }
    
  } catch (err: any) {
    console.error("Error deleting custom field:", err);
    toast.error(
      err?.response?.data?.message || err?.response?.message || "Failed to delete custom field"
    );
  } finally {
    setCustomFieldLoading(false);
  }
};


  // Edit custom field
const handleEditCustomField = (item: any) => {
  console.log("Editing item:", item);
  
  // Close the dropdown
  setShowField(null);
  
  // Handle different data structures
  const fieldData = item.field_mappings?.[0] || item;
  
  setEditingCustomField(item);
  setCustomFieldForm({
    field_name: fieldData.field_name || "",
    field_referred_from: fieldData.field_referred_from || "",
    selected_score_field: fieldData.field_referred_from === "call_scoring" 
      ? fieldData.field_name ?? "" 
      : ""
  });
  
  if (fieldData.field_referred_from === "call_scoring") {
    // Find matching group
    const matchingGroup = AllScoreDetails?.data?.find((group: GroupItem) => {
      const groupFieldName = group.params_group_name?.toLowerCase().replace(/\s+/g, '_');
      const itemFieldName = fieldData.field_name?.toLowerCase();
      return groupFieldName === itemFieldName;
    });
    
    if (matchingGroup) {
      setSelectedGroup(matchingGroup);
    }
  }
  
  // Switch to Custom-field tab if not already there
  setFieldTap("Custom-field");
  
  // Scroll to form
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
};
  // Handle metadata field selection
  const handleMetadataSelect = (value: string) => {
    setCustomFieldForm(prev => ({
      ...prev,
      field_name: value,
      field_referred_from: "metadata",
      selected_score_field: ""
    }));
    setSelectedGroup(null);
  };

  // Check if custom field form is valid
  const isCustomFieldValid = () => {
    return (
      customFieldForm.field_name.trim() !== "" &&
      customFieldForm.field_referred_from.trim() !== ""
    );
  };

  // Check if field is duplicate and show tick
  const shouldShowDuplicateTick = () => {
    if (!customFieldForm.field_name || !customFieldForm.field_referred_from) return false;
    if (editingCustomField) return false; // Don't show for editing
    
    return isDuplicateCustomField(customFieldForm.field_name, customFieldForm.field_referred_from);
  };

  // Original functions (keep these as they are)
  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleAddField = () => {
    setFields([...fields, { field: "", instruction: "" }]);
  };

  const isSaveDisabled =
    loading ||
    fields.length === 0 ||
    fields.some((f) => !f.field.trim() || !f.instruction.trim());

  const handleChange = (
    index: number,
    key: "field" | "instruction",
    value: string
  ) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  const handleToggle = async () => {
    const newEnable = !enable;
    setEnable(newEnable);

    const payload = {
      enable: newEnable,
    };

    try {
      setLoading(true);
      const response = await requestApi("POST", `${tenant_id}/field/mappings/`, payload, "authService");
      dispatch(FetchMappingApi());
      toast.success(response?.message || "Field mapping updated successfully!");
    } catch (error) {
      console.error("Error updating toggle:", error);
      toast.error("Failed to update toggle");
      setEnable(!newEnable);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(-1);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const handleEdit = (item: any) => {
    setFieldName(item.field);
    setInstruction(item.instruction);
    setOldFieldName(item.field);
    setIsEditing(true);
    setShowUpdates(null);
    setFields([{ field: item.field, instruction: item.instruction }]);

    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = 0;
    }
  };

  const handleDelete = async (item: any) => {
    try {
      setLoading(true);
      
      if (!item?.field || item.field.trim() === "") {
        toast.error("Field name is required");
        setShowUpdates(null);
        return;
      }

      const response = await requestApi(
        "DELETE",
        `${tenant_id}/field/mappings/?field_name=${encodeURIComponent(item.field)}`,
        {},
        "authService"
      );

      toast.success(response?.message || "Field deleted successfully");
      dispatch(FetchMappingApi());
      setShowUpdates(null);
      
      if (fieldName === item.field) {
        resetForm();
      }
    } catch (error: any) {
      console.error("Error deleting item:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong while deleting the field mapping.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFieldName("");
    setInstruction("");
    setFields([{ field: "", instruction: "" }]);
    setIsEditing(false);
    setOldFieldName("");
  };

  const saveFieldName = async () => {
    setLoading(true);

    let payload;
    let endpoint;
    let method;

    if (isEditing) {
      method = "PUT";
      endpoint = `${tenant_id}/field/mappings/`;
      payload = {
        field_name: oldFieldName,
        new_data: { field: fieldName, instruction: instruction },
      };
    } else {
      method = "POST";
      endpoint = `${tenant_id}/field/mappings/`;
      
      const validFields = fields.filter(
        (f) => f.field.trim() && f.instruction.trim()
      );
      
      if (validFields.length === 0 && fieldName.trim() && instruction.trim()) {
        validFields.push({ field: fieldName, instruction: instruction });
      }
      
      if (validFields.length === 0) {
        toast.error("Please fill in at least one field and instruction");
        setLoading(false);
        return;
      }
      
      payload = {
        enable: enable,
        field_download: validFields,
      };
    }

    try {
      const response = await requestApi(method, endpoint, payload, "authService");
      const successMessage = isEditing
        ? "Field mapping updated successfully!"
        : "Field mapping created successfully!";
      toast.success(response?.message || successMessage);
      
      resetForm();
      dispatch(FetchMappingApi());
    } catch (error: any) {
      console.error("Error saving field name:", error);
      const errorMessage = error?.response?.message || error?.message || "Failed to save field mapping";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get all field_mappings from customField data
  const getAllFieldMappings = () => {
  if (!Array.isArray(customField)) return [];

  const allMappings: any[] = [];

  customField.forEach(item => {
    if (Array.isArray(item.field_mappings)) {
      item.field_mappings.forEach((field: any) => {
        allMappings.push({
          ...field,
          config_id: item.config_id
        });
      });
    } else if (item.field_name && item.field_referred_from) {
      allMappings.push({
        field_name: item.field_name,
        field_referred_from: item.field_referred_from,
        config_id: item.config_id
      });
    }
  });

  return allMappings;
};

// const CallScoreREntry =(AllScoreDetails?.data || []).filter((item:any) => item.params_group_name === getAllFieldMappings()?.field_name);

// const CallScoreREntry = (AllScoreDetails?.data || []).filter(
//   (item: any) => item.params_group_name === fieldName
// );


  return (
    <div className="p-4 bg-white rounded-lg shadow-md min-h-[100vh]">
      <div className="flex justify-end mb-4 px-5">
        <div
          className="flex gap-1 cursor-pointer px-4 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-100"
          onClick={handleBack}
        >
          <img
            src={BackArrow}
            alt="Back"
            className="mt-0.5"
          />
          <span className="text-md text-[#1c1d1e]">Back</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-gray-200 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md mt-5">
        <div className="flex flex-col gap-1">
          <h5 className="text-base font-semibold text-gray-800">
            Specific Fields Details ({MappingDetails?.data?.field_download?.length || 0})
          </h5>
          <p className="text-sm text-gray-600">
            Manage the specific fields details efficiently.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative w-[35px] h-[20px] rounded-full transition-all duration-300 ease-in-out cursor-pointer
              ${enable ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span
              className={`absolute top-[4px] left-[4px] w-[13px] h-[13px] bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
                ${enable ? "translate-x-[14px]" : ""}`}
            ></span>
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-3 mt-4 px-4 text-sm md:text-md font-semibold border-b border-[#f5f6f7] pb-2 overflow-x-auto">
        {["Create-field", "Custom-field"].map((value, index) => {
          return (
            <button
              key={index}
              onClick={() => setFieldTap(value)}
              className={`flex-shrink-0 min-w-[90px] px-3 py-2 text-md text-[#181D27] flex items-center justify-center text-center capitalize font-medium transition-all duration-200 rounded-md cursor-pointer outline-none ${
                fieldTap === value
                  ? " text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-600"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>

      {/* Create-field Tab */}
      {fieldTap === "Create-field" && (
        <div className="h-[calc(100vh-240px)] overflow-y-scroll mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm scrollbar-thin" ref={scrollableContainerRef}>
          <h5 className="text-lg font-semibold mb-4 text-gray-800">Create / Edit Specific Fields</h5>

          {isEditing ? (
            <div className="flex flex-wrap gap-4 mb-6 w-full border-l-4 border-blue-500 pl-3 py-4 bg-gray-50 rounded-md">
              <div className="flex flex-col gap-2 w-full md:w-[48%]">
                <label className="text-sm font-medium">Field Name</label>
                <input
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="border rounded-md p-2"
                  placeholder="Enter field name"
                />
              </div>

              <div className="flex flex-col gap-2 w-full md:w-[48%]">
                <label className="text-sm font-medium">Instruction</label>
                <input
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="border rounded-md p-2"
                  placeholder="Enter instruction"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 mb-6 w-full border-l-4 border-blue-500 pl-3 py-4 bg-gray-50 rounded-md max-h-[190px] overflow-y-auto">
              {fields.map((item, index) => (
                <div
                  key={index}
                  className="relative flex flex-wrap gap-4 mb-4 border p-4 rounded-md bg-gray-50 w-full"
                >
                  {fields.length > 1 && (
                    <button
                      onClick={() => handleRemoveField(index)}
                      className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}

                  <div className="flex flex-col gap-2 w-full md:w-[48%]">
                    <label className="text-sm font-medium">Field Name</label>
                    <input
                      value={item.field}
                      onChange={(e) =>
                        handleChange(index, "field", e.target.value)
                      }
                      className="border border-blue-500 rounded-md p-2 outline-none"
                      placeholder="Enter field name"
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-[48%]">
                    <label className="text-sm font-medium">Instruction</label>
                    <input
                      value={item.instruction}
                      onChange={(e) =>
                        handleChange(index, "instruction", e.target.value)
                      }
                      className="border border-blue-500 rounded-md p-2 outline-none"
                      placeholder="Enter instruction"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full items-center">
            <button
              className="border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-100 w-full sm:w-auto"
              onClick={resetForm}
            >
              Cancel
            </button>
            <button
              onClick={saveFieldName}
              disabled={isSaveDisabled}
              className={`bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 flex items-center justify-center gap-2 w-full sm:w-auto ${
                isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isEditing ? "Update" : "Save"}
            </button>
          </div>

          {!isEditing && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleAddField}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex gap-2"
              >
                <img src={AddIcon} alt="Add" /> Add
              </button>
            </div>
          )}

          {/* Existing Data Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center border-b border-gray-300 bg-blue-100 pb-2 mb-3 px-5 py-2 rounded-md">
              <h6 className="text-sm font-semibold text-gray-700">Existing Data</h6>
              <div className="flex items-center justify-center size-7 rounded-full bg-blue-500 text-white text-xs font-semibold">
                {MappingDetails?.data?.field_download?.length || 0}
              </div>
            </div>

            {MappingDetails?.data?.field_download?.length === 0 ? (
              <p className="text-sm text-gray-600 px-5 h-32 flex items-center justify-center">
                No field mappings available.
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {MappingDetails?.data?.field_download?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="relative flex justify-between items-center py-3 px-5 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="mt-1.5 inline-block size-2.5 shrink-0 rounded-full bg-blue-500"></span>

                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 text-sm sm:text-base leading-tight">
                          {item.field}
                        </span>

                        <span className="text-xs sm:text-sm text-gray-600 line-clamp-1 leading-snug">
                          {item.instruction}
                        </span>
                      </div>
                    </div>

                    <img
                      src={MoreVert}
                      alt="more options"
                      className="w-5 h-5 cursor-pointer hover:opacity-75"
                      onClick={() => setShowUpdates(showUpdates === index ? null : index)}
                    />

                    {showUpdates === index && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-md z-10">
                        <button
                          onClick={() => handleEdit(item)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom-field Tab */}
      {fieldTap === "Custom-field" && (
        <div className="min-h-[calc(100vh-220px)] overflow-y-scroll scrollbar-thin">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Custom Field</h3>
              <p className="text-sm text-gray-600 mt-1">Create custom fields from call scoring groups or metadata</p>
            </div>
            {editingCustomField && (
              <div className="mt-2 sm:mt-0 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Editing: {editingCustomField.field_mappings?.[0]?.field_name || editingCustomField.field_name}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 mb-6 border-l-4 border-blue-500 pl-3 py-4 bg-gray-50 rounded-md">
            {/* Field Referred From Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Field Referred From *</label>
                <select
                  value={customFieldForm.field_referred_from}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomFieldForm(prev => ({
                      ...prev,
                      field_referred_from: value,
                      field_name: "",
                      selected_score_field: ""
                    }));
                    setSelectedGroup(null);
                  }}
                  className="w-full rounded-lg px-3 py-2 bg-white shadow-sm border-2 border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">Select Source</option>
                  <option value="call_scoring">Call Scoring</option>
                  <option value="metadata">Metadata</option>
                </select>
              </div>

              {/* Conditionally render based on selection */}
              {customFieldForm.field_referred_from === "call_scoring" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Field name
                    <span className="min-h-4 min-w-4 rounded-full bg-blue-500 text-white flex justify-center items-center text-xs">
                      {AllScoreDetails?.data?.length || 0}
                    </span>
                  </label>
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setShowGroup(showGroup === 0 ? null : 0)}
                      className="w-full rounded-lg px-3 py-2 bg-white text-left shadow-sm border-2 border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 flex justify-between items-center"
                    >
                      {selectedGroup ? selectedGroup.params_group_name : "Select Score Group"}
                    </button>

                    {/* Update the group dropdown in the JSX */}
{showGroup === 0 && (
  <div className="absolute z-10 mt-1 h-[200px] overflow-y-scroll scrollbar-thin w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-60 p-2">
    {AllScoreDetails?.data?.length === 0 ? (
      <span className="text-sm text-gray-500 px-2 py-1 block">
        Group not available
      </span>
    ) : (
      <div>
        {AllScoreDetails?.data?.map((group: GroupItem, i: number) => {
          const groupName = group?.params_group_name || "Unnamed Group";
          const isUsed = isGroupAlreadyUsed(groupName);
          const isSelected = selectedGroup?.params_group_name === groupName;
          
          // Check if this group is being edited (should be selectable)
          const isEditingThisGroup = editingCustomField && 
            editingCustomField.field_mappings?.[0]?.field_name === groupName.replace(/\s+/g, '_').toLowerCase();
          
          // Disable if used and not being edited
          const isDisabled = isUsed && !isEditingThisGroup;
          
          return (
            <button
              key={i}
              onClick={() => !isDisabled && handleGroupSelect(group)}
              disabled={isDisabled}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                isDisabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-blue-50 cursor-pointer'
              }`}
              title={isDisabled ? "This group is already used as a custom field" : ""}
            >
              <span className={isDisabled ? 'line-through' : ''}>
                {groupName}
              </span>
              <div className="flex items-center gap-2">
                {isSelected && (
                  <img src={CheckIcon} alt="Selected" className="w-4 h-4" />
                )}
                {isUsed && !isEditingThisGroup && (
                  <span className="text-xs text-red-500">(Already used)</span>
                )}
                {isEditingThisGroup && (
                  <span className="text-xs text-blue-500">(Editing)</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
)}
                  </div>
                </div>
              )}

              {customFieldForm.field_referred_from === "metadata" && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Field Name</label>
                  <select
                    value={customFieldForm.field_name}
                    onChange={(e) => handleMetadataSelect(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 bg-white shadow-sm border-2 border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">Select Field</option>
                    <option value="phone">Phone</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              )}
            </div>

            {/* Field Name Input */}
            {/* <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Field Name *
                {shouldShowDuplicateTick() && (
                  <span className="flex items-center gap-1 text-red-600 text-xs">
                    <img src={CheckIcon} alt="Duplicate" className="w-4 h-4" />
                    Field already exists
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customFieldForm.field_name}
                  onChange={(e) => setCustomFieldForm(prev => ({
                    ...prev,
                    field_name: e.target.value
                  }))}
                  className={`w-full rounded-lg px-3 py-2 shadow-sm border-2 focus:outline-none focus:ring-1 ${
                    shouldShowDuplicateTick() 
                      ? 'border-red-400 focus:ring-red-400' 
                      : 'border-blue-400 focus:ring-blue-400'
                  }`}
                  placeholder="Enter field name"
                  disabled={customFieldForm.field_referred_from === "metadata"}
                />
                {shouldShowDuplicateTick() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600">
                    ⚠️
                  </div>
                )}
              </div>
            </div> */}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={resetCustomFieldForm}
                className="border border-gray-300 rounded-md py-1 px-3 hover:bg-gray-100 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={saveCustomField}
                disabled={!isCustomFieldValid() || customFieldLoading || shouldShowDuplicateTick()}
                className={`bg-blue-500 text-white rounded-md py-1 px-3 hover:bg-blue-600 flex items-center justify-center gap-2 w-full sm:w-auto ${
                  (!isCustomFieldValid() || customFieldLoading || shouldShowDuplicateTick()) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {customFieldLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {editingCustomField ? "Update" : "Save"}
              </button>
            </div>
          </div>

          {/* Existing Custom Fields List */}
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-300 bg-blue-100 pb-2 mb-3 px-5 py-2 rounded-md">
              <h6 className="text-sm font-semibold text-gray-700">Existing Custom Fields</h6>
              <div className="flex items-center justify-center size-7 rounded-full bg-blue-500 text-white text-xs font-semibold">
                {getAllFieldMappings().length || 0}
              </div>
            </div>

            {getAllFieldMappings().length === 0 ? (
              <p className="text-sm text-gray-600 px-5 h-32 flex items-center justify-center">
                No custom fields available.
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {getAllFieldMappings().map((item:any, index: number) => (
                  <div
                    key={index}
                    className="relative flex justify-between items-center py-3 px-5 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="mt-1.5 inline-block size-2.5 shrink-0 rounded-full bg-blue-500"></span>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 text-sm sm:text-base leading-tight">
                          {item.field_name}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 line-clamp-1 leading-snug">
                          {/* Source: */}
                           {item.field_referred_from}
                          {/* {item.field_referred_from === "call_scoring" && " (Call Scoring)"}
                          {item.field_referred_from === "metadata" && " (Metadata)"} */}
                        </span>
                      </div>
                    </div>


                    <div className="relative">
  <button
    className="more-vert-button p-1 rounded-full hover:bg-gray-100 transition-colors"
    onClick={(e) => {
      e.stopPropagation();
      setShowField(showField === index ? null : index);
    }}
  >
    <img
      src={MoreVert}
      alt="more options"
      className="w-6 h-6 cursor-pointer"
    />
  </button>
  
  {showField === index && (
    <div 
      className="dropdown-menu absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px] py-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          handleEditCustomField(item);
        }}
      >
        <img src={EditImg} alt="Edit" className="w-4 h-4" />
        Edit
      </button>
      <button
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteCustomField(item);
        }}
      >
        <img src={DeleteImg} alt="Delete" className="w-4 h-4" />
        Delete
      </button>
    </div>
  )}
</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

export default CallScore;