import React, { useEffect, useState } from 'react';
import { useSchemaStore } from "../store/schemaStore";
import { ActiveIntegrationApp } from "../types/ActiveIntegrationApp";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, ArrowLeftRight } from "lucide-react";
import { cn, errorHandler } from "../lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDirectoryTabStore } from "../store/directoryTabStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearchParams } from "react-router-dom";
import { UserMappingPayload } from "../types/UserMappingPayload";

interface UserMappingProps {
    selectedApp: ActiveIntegrationApp;
    onNext?: () => void;
}

interface AttributeMapping {
    name: string;
    map: boolean;
    mapping: string | null;
    primary_attribute: boolean;
    mandatory_attributes: boolean;
}

const UserMapping: React.FC<UserMappingProps> = ({ selectedApp, onNext }) => {
    const [searchParams] = useSearchParams();
    const loadSchema = useSchemaStore(state => state.loadSchema);
    const schema = useSchemaStore(state => state.schema);
    const schemaLoading = useSchemaStore(state => state.loading);
    const { saveUserMapping, fetchUserAttributes, loading } = useDirectoryTabStore();

    const { toast } = useToast();
    const [mappings, setMappings] = useState<AttributeMapping[]>([]);
    const [dirAttributes, setDirAttributes] = useState<string[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            loadSchema();

            const userInfoString = localStorage.getItem("userInfo");
            const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
            const tenantId = searchParams.get('tenantId') || localStorage.getItem("tenant_id") || "";
            const urlIdentifier = userInfo.urlidentifier || tenantId;

            const dirInfo = selectedApp?.basicInfo?.dirInfo || {};
            const configId = searchParams.get('id') ||
                dirInfo.configuration?.client_id ||
                dirInfo.configuration?.aws_config?.access_key_id;

            if (configId && selectedApp.appName) {
                try {
                    const result = await fetchUserAttributes(
                        selectedApp.appName,
                        configId,
                        urlIdentifier,
                        tenantId
                    );

                    if (result?.status === "success" && result.data) {
                        setDirAttributes(result.data);
                    }
                } catch (error) {
                    console.error("Error fetching attributes:", error);
                    toast({
                        variant: "error",
                        description: "Failed to fetch directory attributes. Please check your configuration."
                    });
                }
            }
        };

        loadInitialData();
    }, [loadSchema, selectedApp.appName, searchParams, fetchUserAttributes]);

    useEffect(() => {
        if (schema && schema.attribute_mapping) {
            const existingMappings = selectedApp?.basicInfo?.attributemappings?.mapped_attributes?.[0] || {};

            const initialMappings = schema.attribute_mapping.map(attr => ({
                name: attr.attribute_name,
                map: !!existingMappings[attr.attribute_name],
                mapping: existingMappings[attr.attribute_name] || null,
                primary_attribute: attr.attribute_name === schema.primary_attribute,
                mandatory_attributes: schema.mandatory_attributes.includes(attr.attribute_name)
            }));

            // Filter out countryCode as seen in Angular logic
            const filteredMappings = initialMappings.filter(m => m.name !== 'countryCode');
            setMappings(filteredMappings);
        }
    }, [schema, selectedApp?.basicInfo?.attributemappings]);

    const handleMappingChange = (index: number, value: string) => {
        const newMappings = [...mappings];
        newMappings[index].mapping = value === "null" ? null : value; // Handle "null" string from Select
        newMappings[index].map = !!newMappings[index].mapping;
        setMappings(newMappings);
    };

    const isFormValid = () => {
        // Check if all mandatory attributes are mapped
        return mappings.every(m => !m.mandatory_attributes || (m.mandatory_attributes && m.map));
    };

    const handleSave = async () => {
        if (!schema || !selectedApp) return;
        const userInfoString = localStorage.getItem("userInfo");
        const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
        const tenantId = searchParams.get('tenantId') || localStorage.getItem("tenant_id") || "";
        const urlIdentifier = userInfo.urlidentifier || tenantId;

        const mappingObject: Record<string, string | null> = {};
        mappings.forEach(m => {
            mappingObject[m.name] = m.mapping;
        });

        const dirInfo = selectedApp.basicInfo?.dirInfo || {};
        const payload: UserMappingPayload = {
            access_key_id: '',
            client_id: '',
            orgId: urlIdentifier,
            schema_id: schema.id,
            mapped_attributes: [mappingObject],
            created_on: new Date().toISOString(),
            created_by: urlIdentifier,
            infisigntenantId: tenantId,
            tenantUniqueIdentifier: tenantId,
            urlIdentifier: urlIdentifier,
        };

        if (dirInfo.client_id) {
            payload.client_id = dirInfo.client_id;
        } else if (dirInfo.aws_config?.access_key_id) {
            payload.access_key_id = dirInfo.aws_config.access_key_id;
        }
        const result = await saveUserMapping(selectedApp.appName, payload);

        if (result?.status === "success") {
            toast({
                variant: "success",
                title: "Success",
                description: "Attributes mapped successfully",
            });
            if (onNext) onNext();
        } else {
            toast({
                variant: "error",
                description: result?.message || "Failed to map attributes",
            });
        }
    };

    if (schemaLoading) {
        return <div className="p-4 flex justify-center">Loading schema...</div>;
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-4xl mt-6">
                <div className="flex flex-col mt-8">
                    <div className="text-xl font-medium">User Mapping<span className="text-orange-500 ml-1">*</span></div>

                    {/* Header Cards */}
                    <div className="flex flex-row space-x-4 mt-6 mb-6">
                        <div className="flex-1 border rounded-lg p-4 flex items-center space-x-3 bg-white">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                {/* Placeholder for favicon/Thunai icon */}
                                <div className="text-lg font-bold text-blue-600">T</div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Thunai Attributes</h3>
                                <p className="text-sm text-gray-500">User</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center text-gray-400">
                            <ArrowLeftRight />
                        </div>

                        <div className="flex-1 border rounded-lg p-4 flex items-center space-x-3 bg-white">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <img src={selectedApp?.iconUrl} alt={selectedApp?.appName} className="h-8 w-8 object-contain" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">{selectedApp?.appName?.split(' ')[0]} Attributes</h3>
                                <p className="text-sm text-gray-500">User</p>
                            </div>
                        </div>
                    </div>

                    {/* Mapping List */}
                    <div className="flex flex-col space-y-4">
                        {mappings.map((attr, index) => {
                            return (
                                <div key={attr.name} className="flex flex-row items-center space-x-4">
                                    {/* Left Side: Thunai Attribute */}
                                    <div className={cn(
                                        "flex-1 flex items-center justify-between border rounded-md p-3 bg-white shadow-sm h-12", // Fixed height for alignment
                                        (attr.primary_attribute || attr.mandatory_attributes) && !attr.map && "border-l-4 border-l-red-500", // Visual cue for mandatory
                                        attr.map && "border-green-300 shadow-md"
                                    )}>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium">
                                                {attr.name}
                                                {(attr.primary_attribute || attr.mandatory_attributes) && <span className="text-red-500 ml-1">*</span>}
                                            </span>
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    {attr.name === 'email' && <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Select email attribute from {selectedApp?.appName} to map to Thunai email.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    {/* Right Side: App Attribute Dropdown */}
                                    <div className="flex-1">
                                        <Select
                                            value={attr.mapping || ""}
                                            onValueChange={(value) => handleMappingChange(index, value)}
                                        >
                                            <SelectTrigger className={cn("h-12", attr.map && "border-green-300 shadow-md")}>
                                                <SelectValue placeholder="Select Attribute" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="null">Select Attribute</SelectItem>
                                                {dirAttributes.map((dirAttr) => (
                                                    <SelectItem key={dirAttr} value={dirAttr}>
                                                        {dirAttr}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )
                        }
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex justify-end mb-10">
                        <Button
                            onClick={handleSave}
                            disabled={!isFormValid() || loading.userMappingLoading}
                        >
                            {loading.userMappingLoading ? "Saving..." : "Save & Next"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserMapping;
