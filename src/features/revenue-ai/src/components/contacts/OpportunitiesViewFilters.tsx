import React, { useEffect, useState } from 'react';
import { FilterIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MultiSelect from '../../components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// import { useUserStore } from '@/store/userStore'
// import { useRoleStore } from '@/store/roleStore';
import { getDefaultOperator, getOperatorList } from '../../lib/operatorMap';
import { opportunityViewFilterList } from '../../lib/opportunityViewFilterList';
import { cn } from '@/lib/utils';
import { useOpportunityStore } from '../../store/opportunityStore';
import { FilterCondition, FilterSchema } from '../../types/FilterTypes';
import { useUserManagementStore } from '../../store/userManagementStore';

type OpportunitiesViewFiltersProps = {
    onCloseFilter: React.Dispatch<React.SetStateAction<boolean>>;
    setFilters: React.Dispatch<React.SetStateAction<FilterSchema[]>>;
    selectedFilters: FilterSchema[];
    setSelectedFilters: React.Dispatch<React.SetStateAction<FilterSchema[]>>;
    filterConditions: FilterCondition[];
    setFilterConditions: React.Dispatch<React.SetStateAction<FilterCondition[]>>;
    selectedIndex: number | null;
    setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

const OpportunitiesViewFilters: React.FC<OpportunitiesViewFiltersProps> = ({ onCloseFilter, setFilters, selectedFilters, setSelectedFilters, filterConditions, setFilterConditions, selectedIndex, setSelectedIndex }) => {

    const [showFilterList, setShowFilterList] = useState<boolean>(false);
    const todayDate = new Date().toISOString().split('T')[0];
    const { users, loadUsers, loading } = useUserManagementStore();

    const { resetPagination } = useOpportunityStore();

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const userData = !loading.usersLoading && users.map(user => ({ label: user.name, value: user.user_id }));

    const filterList = opportunityViewFilterList.map(item => item.key_name === "assignee" ? { ...item, rowData: userData } : item);

    console.log(filterList)

    const isSelected = (filterParam: FilterSchema): boolean => {
        return selectedFilters.some(filter => filter.key_name === filterParam.key_name);
    }
    const onSelectedFilters = (filter: FilterSchema) => {
        if (isSelected(filter)) return;
        setSelectedFilters(prev => ([...prev, filter]));
        const defaultOperator = getDefaultOperator(filter.key_name, filter.inputtype)
        setFilterConditions(filterCondition => ([...filterCondition, {
            filterField: filter.key_name,
            condition: defaultOperator,
            filterValue: filter.key_value,
            keyvalue_to: ""
        }]));
        setSelectedIndex(selectedFilters.length)
        setShowFilterList(false);
    }

    const removeFilter = (index: number) => {
        const newSelectedFilters = selectedFilters.filter((_, i) => i !== index);
        const newConditions = filterConditions.filter((_, i) => i !== index);
        setSelectedFilters(newSelectedFilters);
        setFilterConditions(newConditions);
        // setSelectedIndex(0);

        if (newSelectedFilters.length === 0) {
            setShowFilterList(false);
            setSelectedIndex(null)
        } else {
            const newIndex = index >= newSelectedFilters.length ? newSelectedFilters.length - 1 : index;
            setSelectedIndex(newIndex)
        }
    }

    const updateConditions = (index: number, field: keyof FilterCondition, value: unknown) => {
        const newConditions = [...filterConditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setFilterConditions(newConditions);
    }

    const handleViewFilters = (filter: FilterSchema, index: number) => {
        setSelectedIndex(index);
        setShowFilterList(false);

        if (!filterConditions[index].condition) {
            const defaultOperator = getDefaultOperator(filter.key_name, filter.inputtype);
            updateConditions(index, "condition", defaultOperator)
        }
    }

    const handleSubmit = () => {
        const filters: FilterSchema[] = filterConditions.filter(condition => {
            if (Array.isArray(condition.filterValue)) {
                return condition.filterField && condition.condition && condition.filterValue.length > 0
            }

            return condition.filterField && condition.condition && condition.filterValue;
        }).map((condition, index) => {
            const schema = selectedFilters[index];
            let formattedValue: string | string[] = condition.filterValue;

            if (schema?.inputtype === "date" && typeof formattedValue === "string") {
                formattedValue = new Date(formattedValue).toISOString();
            }

            if (schema?.inputtype === "multiselect" && !Array.isArray(formattedValue)) {
                formattedValue = [formattedValue]
            }


            return {
                key_name: condition.filterField,
                key_value: formattedValue,
                operator: condition.condition,
                inputtype: schema?.inputtype
            } as FilterSchema;
        });

        setFilters(filters);
        onCloseFilter(false);
        resetPagination();
    }

    console.log(selectedFilters[selectedIndex], "FILTERLIST")


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[5]">
            <div className="bg-white rounded shadow-xl w-full max-w-xl h-[100vh] flex flex-col">
                <div className="relative flex justify-between items-center bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-1 px-2 shadow-xl backdrop-blur-lg border-b border-white/10">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <h2 className="text-sm tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Advanced Filters</h2>
                            <div className="absolute -bottom-2 left-0 w-12 h-[2px] bg-gradient-to-r from-blue-400 to-indigo-300"></div>
                        </div>
                    </div>
                    <button className="relative rounded-xl p-3 transition-all duration-300 hover:scale-105 group" onClick={() => onCloseFilter(false)}>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-sm group-hover:blur-md transition-all duration-300"></div>
                        <div className="relative flex items-center space-x-2">
                            <span className="text-sm font-medium opacity-0 max-w-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap text-blue-200">
                                Close
                            </span>
                            <X className="h-4 w-4 text-blue-300 group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                    </button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/2 p-4 border-r-2 border-gray-200 flex flex-col">
                        <div className="mb-4">
                            <p className="text-gray-700 font-semibold">Advanced filter</p>
                            <p className="text-gray-500 text-sm mt-2">Refine your results with custom filters</p>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {selectedFilters.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedFilters.map((filter, i) => (
                                        <div key={filter.key_name} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedIndex === i
                                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-500 shadow-indigo-100' : 'bg-white border border-indigo-200 hover:border-indigo-300'
                                            }`} onClick={() => handleViewFilters(filter, i)}>
                                            <div className="flex items-center space-x-3">
                                                <label className="font-medium text-gray-700">
                                                    {filter.label}
                                                    {/* Show the selected value for this filter */}
                                                    {filterConditions[filter.key_name]?.filterValue && (
                                                        <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                                            {
                                                                filterConditions[filter.key_name].filterValue
                                                            }
                                                        </span>
                                                    )}
                                                </label>
                                            </div>
                                            <button className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 opacity-60 hover:opacity-100" onClick={() => removeFilter(i)}>
                                                <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) :
                                (<div className="flex flex-col items-center justify-center p-8 space-y-6">
                                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                                        <FilterIcon className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <div className="text-center space-y-3 max-w-sm">
                                        <h3 className="text-lg font-semibold text-gray-800">No Filters Applied</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Add filters to narrow down your results and find specific items more quickly.
                                        </p>
                                    </div>
                                </div>)
                            }
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                            <Button variant="outline" size="sm" className="text-sm" onClick={() => setShowFilterList(true)}>Add Filter</Button>
                            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" onClick={() => handleSubmit()}>Apply Filters</Button>
                        </div>
                    </div>
                    <div className="w-1/2 p-4 bg-gradient-to-br from-slate-50 to-indigo-50">
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 font-bold mb-3 text-lg">{selectedFilters.length === 0 ? "Select Filter" : "Edit Filter"}</p>
                        {(showFilterList || selectedFilters.length === 0) && (
                            <div className="grid grid-cols-2 gap-3">
                                {filterList.map((filter, index) => (
                                    <div key={index} role="button" className={cn("bg-white/60 border-indigo-100 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 hover:shadow-md p-3 rounded-lg border transition-all duration-200", isSelected(filter) && "bg-gray-100 opacity-50 cursor-not-allowed border-gray-200")} onClick={() => onSelectedFilters(filter)}>
                                        <span className="text-sm font-medium text-gray-700">{filter.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!showFilterList && selectedIndex !== null && selectedFilters[selectedIndex] && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-200 shadow-sm">
                                <label className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold mb-4 block">{selectedFilters[selectedIndex]?.label}</label>
                                <div className="mb-4">
                                    <Select value={filterConditions[selectedIndex]?.condition || ""} onValueChange={(value) => updateConditions(selectedIndex, "condition", value)}>
                                        <SelectTrigger className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300">
                                            <SelectValue placeholder="Choose condition" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
                                            {getOperatorList(selectedFilters[selectedIndex]?.inputtype).map(operator => (
                                                <SelectItem key={operator.value} value={operator.value}>
                                                    {operator.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedFilters[selectedIndex]?.inputtype === "textbox" && <Input
                                    type="text"
                                    value={filterConditions[selectedIndex]?.filterValue || ''}
                                    onChange={(e) => updateConditions(selectedIndex, 'filterValue', e.target.value)}
                                    placeholder="Enter value"
                                    className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300"
                                />}

                                {selectedFilters[selectedIndex].inputtype === 'number' && (
                                    <Input
                                        type="number"
                                        value={filterConditions[selectedIndex]?.filterValue || ''}
                                        onChange={(e) => updateConditions(selectedIndex, 'filterValue', e.target.value)}
                                        placeholder="Enter value"
                                        className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300"
                                    />
                                )}

                                {selectedFilters[selectedIndex].inputtype === 'date' && (
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <div className="text-sm text-indigo-600 font-medium">From</div>
                                            <Input
                                                type="date"
                                                value={filterConditions[selectedIndex]?.filterValue || ''}
                                                onChange={(e) => updateConditions(selectedIndex, 'filterValue', e.target.value)}
                                                max={todayDate}
                                                className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm text-indigo-600 font-medium">To</div>
                                            <Input
                                                type="date"
                                                value={filterConditions[selectedIndex]?.keyvalue_to || ''}
                                                onChange={(e) => updateConditions(selectedIndex, 'keyvalue_to', e.target.value)}
                                                min={filterConditions[selectedIndex]?.filterValue}
                                                max={todayDate}
                                                className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedFilters[selectedIndex].inputtype === 'select' && (
                                    <Select
                                        value={filterConditions[selectedIndex]?.filterValue || ''}
                                        onValueChange={(value) => updateConditions(selectedIndex, 'filterValue', value)}
                                    >
                                        <SelectTrigger className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-300">
                                            <SelectValue placeholder="Choose option" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
                                            {selectedFilters[selectedIndex].rowData?.map((option, idx) => (
                                                <SelectItem key={idx} value={option.value || option}>
                                                    {option.label || option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {selectedFilters[selectedIndex].inputtype === 'multiselect' && (
                                    <div className="space-y-2">
                                        <div className="text-sm text-indigo-600 font-medium mb-2">Select options:</div>
                                        <MultiSelect
                                            options={selectedFilters[selectedIndex].rowData || []}
                                            selectedValues={Array.isArray(filterConditions[selectedIndex]?.filterValue)
                                                ? filterConditions[selectedIndex].filterValue
                                                : []
                                            }
                                            onSelectionChange={(newValues) => {
                                                updateConditions(selectedIndex, 'filterValue', newValues);
                                            }}
                                            placeholder="Choose options..."
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OpportunitiesViewFilters;