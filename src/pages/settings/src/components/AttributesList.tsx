import React from 'react';
// import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { cn, icons } from "../lib/utils";
import { Attribute } from "../types/Attribute";

import SchemaEditIcon from "../assets/images/schema-edit-icon.svg";
import SchemaDeleteIcon from "../assets/images/schema-delete-icon.svg";

type AttributesListProps = {
    title: string;
    attributes: Attribute[];
    openEdit?: (value: Attribute) => void;
    onOpenDelete?: (value: string) => void;
}

const AttributesList: React.FC<AttributesListProps> = ({ title, attributes, openEdit, onOpenDelete }) => {

    return (
        <>

            <div className={cn("rounded-xl p-4 border border-gray-200 max-h-[calc(100vh-340px)] md:h-full sm:p-6 sm:rounded-2xl", title === "All Attributes" ? "bg-gray-50" : "bg-blue-50 mt-4 lg:mt-0")}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                </div>
                <div className="space-y-2 max-h-[calc(100vh-430px)] overflow-y-auto pr-2">
                    {attributes.map(attribute => (
                        <div key={attribute.attribute_name} className="flex items-center justify-between p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <img src={icons[attribute.attribute_type]} alt={attribute.attribute_type} className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{attribute.attribute_name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{attribute.attribute_type}</p>
                                </div>
                                {title === "All Attributes" && attribute.is_default &&
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
                                        Default
                                    </span>
                                }
                                {title === "Selected Attributes" && <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex-shrink-0">
                                    Selected
                                </span>}
                            </div>
                            {title === "All Attributes" &&
                                <div className="flex items-center space-x-2 ml-3">
                                    {!attribute.is_default &&
                                        <>
                                            <Button variant="ghost" className="w-8 h-8 p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200" onClick={() => openEdit(attribute)}>
                                                <img
                                                    className="w-4 h-4"
                                                    src={SchemaEditIcon}
                                                    alt="Edit"
                                                />
                                            </Button>

                                            <Button variant="ghost" className="w-8 h-8 p-1 hover:bg-red-50 rounded-lg transition-colors duration-200" onClick={() => onOpenDelete(attribute.id)}>
                                                <img
                                                    className="w-4 h-4"
                                                    src={SchemaDeleteIcon}
                                                    alt="Delete"
                                                />
                                            </Button>

                                        </>
                                    }
                                    {/* <div className="w-8 h-8 flex items-center justify-center">
                                        <Input
                                            type="checkbox"
                                            disabled={attribute.is_default}
                                            checked={attribute.is_default}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                        />
                                    </div> */}
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </div>
        </>

    )
}

export default AttributesList