import React, { FC, useState } from "react";
import { Trash2, Plus, Sparkles, Check, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import Select from "react-select";  // Import react-select
import { useWidgetStore } from '../../../stores/widgetStore';
import { getTenantId, requestApi } from "@/services/authService";

interface CustomFieldProps {
  fields: any[];
  selectedCustomFields: any;
  updateField: (id: string, key: string, value: string) => void;
  removeField: (id: string) => void;
  handleResize: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  addField: () => void;
}

const CustomFields: FC<CustomFieldProps> = ({
  fields,
  selectedCustomFields,
  updateField,
  removeField,
  handleResize,
  addField,
}) => {
  const [suggestions, setSuggestions] = useState<{ [key: string]: string }>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");  // Search term state

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
   const { widgetId } = useWidgetStore();
   const tenantId = getTenantId()

  const fetchSuggestion = async (fieldId: string, fieldName: string) => {
    if (!fieldName) return;

    try {
      setLoadingSuggestions((prev) => ({ ...prev, [fieldId]: true }));

      // const response = await fetch(
      //   `https://api.thunai.ai/chat-service/chatai/api/v1/${tenantId}/email/agent/customfields`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //       "x-csrftoken": csrfToken || ""
      //     },
      //     body: JSON.stringify({
      //       fields: [fieldName],
      //     }),
      //   }
      // );

      // const data = await response.json();
 const response = await requestApi(
      "POST",
      `${tenantId}/email/agent/customfields`,
      { fields: [fieldName] },
      "chatService"
    );
      const data = response

      if (data?.instructions?.instructions?.custom_fields?.[0]?.description) {
        setSuggestions((prev) => ({
          ...prev,
          [fieldId]: data.instructions.instructions.custom_fields[0].description,
        }));
      }
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
    } finally {
      setLoadingSuggestions((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const acceptSuggestion = (fieldId: string) => {
    updateField(fieldId, "instructions", suggestions[fieldId]);
    setSuggestions((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const dismissSuggestion = (fieldId: string) => {
    setSuggestions((prev) => ({ ...prev, [fieldId]: "" }));
  };

  // Convert selectedCustomFields into options for react-select
  const fieldOptions = Object.keys(selectedCustomFields).map((fieldId) => ({
    value: fieldId,
    label: selectedCustomFields[fieldId].name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
          <p className="text-sm text-gray-500 mt-1">Configure custom fields with AI-powered suggestions</p>
        </div>
        <button
          onClick={addField}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus size={16} />
          Add Field
        </button>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No custom fields yet</h3>
            <p className="text-sm text-gray-500 mb-4">Get started by adding your first custom field</p>
            <button
              onClick={addField}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Your First Field
            </button>
          </div>
        ) : (
          fields.map((field: any, index: number) => {
            if (!field.id || (typeof field.id !== "string" && isNaN(Number(field.id)))) {
              console.warn("Invalid field ID detected:", field);
              return null;
            }

            const hasSelectedField = field.selectedField && selectedCustomFields[field.selectedField];
            const hasSuggestion = suggestions[field.id];
            const isLoadingSuggestion = loadingSuggestions[field.id];

            return (
              <div key={field.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Field Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <h3 className="text-base font-medium text-gray-900">Custom Field Configuration</h3>
                    </div>
                    <button
                      onClick={() => removeField(field.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Remove field"
                    >
                      <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Field Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Field Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Field Name
                      </label>
                      {/* React-Select Dropdown */}
                      <Select
                        options={fieldOptions}
                        value={field.selectedField ? { value: field.selectedField, label: selectedCustomFields[field.selectedField]?.name } : null}
                        onChange={(selectedOption) => {
                          const value = selectedOption?.value || "";
                          updateField(field.id, "selectedField", value);
                          setSuggestions((prev) => ({ ...prev, [field.id]: "" }));
                        }}
                        placeholder="Select a field..."
                        className="w-full text-black"
                      />
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Instructions
                        </label>
                        {hasSelectedField && (
                          <button
                            onClick={() =>
                              fetchSuggestion(field.id, selectedCustomFields[field.selectedField]?.name || "")
                            }
                            disabled={isLoadingSuggestion}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {isLoadingSuggestion ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            {isLoadingSuggestion ? "Generating..." : "AI Suggest"}
                          </button>
                        )}
                      </div>
                      <textarea
                        value={field.instructions}
                        onChange={(e) => {
                          updateField(field.id, "instructions", e.target.value);
                          handleResize(e);
                        }}
                        placeholder={hasSelectedField ? "Enter instructions for this field..." : "Select a field first to add instructions"}
                        disabled={!hasSelectedField}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  {hasSuggestion && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <Sparkles size={12} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">AI Suggestion</h4>
                          <p className="text-sm text-blue-800 leading-relaxed mb-3">
                            {suggestions[field.id]}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => acceptSuggestion(field.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => dismissSuggestion(field.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CustomFields;
