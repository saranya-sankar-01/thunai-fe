import { useMemo, useState } from "react";
import { BarChart3, Filter, Merge, Plus, Search, Users } from "lucide-react";
import { cn } from "../../lib/utils";
import { FilterCondition, FilterSchema } from "../../types/FilterTypes";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import OpportunitiesListView from "./OpportunitiesListView";
import OpportunitiesViewFilters from "./OpportunitiesViewFilters";
import { OpportunityFunnelView } from "./OpportunityFunnelView";
import { Opportunity } from "../../types/Opportunity";
import { useDebounce } from "@/hooks/useDebounce";
import { BulkUploadOpportunities } from "./BulkUploadOpportunities";

type OpportunitiesViewProps = {
    onSelectOpportunity?: (opportunity: Opportunity) => void;
};

const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({ onSelectOpportunity }) => {
    const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<Set<string>>(() => new Set());
    const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [bulkUploadOpen, setBulkUploadOpen] = useState<boolean>(false);

    const [viewFilter, setViewFilter] = useState<boolean>(false);
    const [filters, setFilters] = useState<FilterSchema[]>([])
    const [selectedFilters, setSelectedFilters] = useState<FilterSchema[]>([]);
    const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    return (
        <div className="h-full bg-white flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Opportunities</h2>
                    <div className="flex items-center gap-2">
                        {selectedOpportunityIds.size >= 2 && (
                            <Button
                                onClick={() => setMergeDialogOpen(true)}
                                variant="default"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Merge className="h-4 w-4" />
                                Merge ({selectedOpportunityIds.size})
                            </Button>
                        )}
                        <Button size="sm" onClick={() => setBulkUploadOpen(true)}>
                            <Plus size={16} className="mr-2" />
                            Bulk Upload
                        </Button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex space-x-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search opportunities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <Button variant="outline" size="sm" onClick={() => setViewFilter(true)}>
                            <Filter size={16} className="mr-2" />
                            Filter
                        </Button>
                        {filters?.length > 0 &&
                            <button className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-400 text-white rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-110 active:scale-100 transition-all duration-300" onClick={() => { setFilters([]); setSelectedFilters([]) }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2.5"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        }
                    </div>
                </div>
            </div>

            {/* Tabs for List and Funnel Views */}
            <div className="flex-1 min-h-0 flex flex-col">
                <Tabs defaultValue="list" className="flex flex-col h-full">
                    <div className="p-2 border-b border-gray-200">
                        <TabsList className="inline-flex">
                            <TabsTrigger value="list" className="flex items-center gap-2 min-w-[120px]" onClick={() => onSelectOpportunity(null)}>
                                <Users size={16} />
                                List View
                            </TabsTrigger>
                            <TabsTrigger value="funnel" className="flex items-center gap-2 min-w-[120px]" onClick={() => onSelectOpportunity(null)}>
                                <BarChart3 size={16} />
                                Funnel View
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="list" className="flex-1 min-h-0 mt-0 h-full">
                        {/* Stats */}
                        <OpportunitiesListView selectedOpportunityIds={selectedOpportunityIds} setSelectedOpportunityIds={setSelectedOpportunityIds} searchTerm={debouncedSearchTerm} mergeDialogOpen={mergeDialogOpen} setMergeDialogOpen={setMergeDialogOpen} filters={filters} onSelectOpportunity={onSelectOpportunity} />
                    </TabsContent>

                    <TabsContent value="funnel" className="flex-1 min-h-0 mt-0 h-full">
                        <OpportunityFunnelView onSelectOpportunity={onSelectOpportunity} />
                    </TabsContent>
                </Tabs>
            </div>


            <div className={cn("fixed inset-y-0 right-0 z-50 w-[550px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out", viewFilter ? "translate-x-0" : "translate-x-full")}>
                <OpportunitiesViewFilters onCloseFilter={setViewFilter} setFilters={setFilters} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterConditions={filterConditions} setFilterConditions={setFilterConditions} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
            </div>
            <BulkUploadOpportunities open={bulkUploadOpen} onOpenChange={setBulkUploadOpen} />
        </div>
    );
};

export default OpportunitiesView;