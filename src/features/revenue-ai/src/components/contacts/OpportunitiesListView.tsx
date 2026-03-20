import { useEffect, useState } from "react";
import { Calendar, DollarSign, Trash2, TrendingUp, Users } from "lucide-react";
import { useOpportunityStore } from "../../store/opportunityStore";
import { Checkbox } from "../ui/checkbox";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { ScrollArea } from "../ui/scroll-area";
import { OpportunityMergeDialog } from "./OpportunityMergeDialog";
import { Opportunity } from "../../types/Opportunity";
import { FilterSchema } from "../../types/FilterTypes";
import { getPaginationNumbers } from "../../lib/utils";
import { Button } from "../ui/button";
import DeleteConfirmationDialog from "../ui/delete-confirmation-dialog";

interface OpportunitiesListViewProps {
    selectedOpportunityIds: Set<string>;
    setSelectedOpportunityIds: React.Dispatch<React.SetStateAction<Set<string>>>
    searchTerm: string;
    mergeDialogOpen: boolean;
    setMergeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    filters: FilterSchema[];
    onSelectOpportunity?: (opportunity: Opportunity) => void;
}

const OpportunitiesListView: React.FC<OpportunitiesListViewProps> = ({ selectedOpportunityIds, setSelectedOpportunityIds, searchTerm, mergeDialogOpen, setMergeDialogOpen, filters, onSelectOpportunity }) => {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { loading, listviewOpportunities, loadListviewOpportunites, listviewAvgConfidence, listviewCurrentPage, listviewTotalItems, listviewTotalPages, setListviewCurrentPage, resetListviewPagination, deleteOpportunity } = useOpportunityStore();
    // const [openNewOpportunity, setOpenNewOpportunity] = useState(false);
    useEffect(() => {
        loadListviewOpportunites(filters, searchTerm);
    }, [loadListviewOpportunites, searchTerm, filters]);

    useEffect(() => {
        resetListviewPagination();
    }, [searchTerm, resetListviewPagination])

    // console.log(listviewTotalPages, "LISTVIEW");

    const getStageColor = (stage: string) => {
        const colors = {
            'Discovery': 'bg-blue-100 text-blue-700',
            'Qualification': 'bg-yellow-100 text-yellow-700',
            'Proposal': 'bg-purple-100 text-purple-700',
            'Negotiation': 'bg-orange-100 text-orange-700',
            'Closed-won': 'bg-green-100 text-green-700',
        };
        return colors[stage] || 'bg-gray-100 text-gray-700';
    };

    const getSelectedOpportunities = () => {
        return listviewOpportunities.filter(opp => selectedOpportunityIds.has(opp.id));
    };

    if (loading.listviewOpportunitiesLoading) {
        return <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
        </div>
    }


    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                    {/* <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {listviewCurrency} {listviewTotalValue.toLocaleString()}
                            ${opportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()} 
                        </div>
                        <div className="text-sm text-gray-500">Total Value</div>
                    </div> */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{listviewTotalItems}</div>
                        <div className="text-sm text-gray-500">Active Deals</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {listviewAvgConfidence}%
                        </div>
                        <div className="text-sm text-gray-500">Avg Confidence</div>
                    </div>
                </div>
            </div>

            {/* Opportunities List */}
            <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                    <div className="p-6 space-y-4">
                        {listviewOpportunities.map((opportunity) => (
                            <div
                                key={opportunity.id}
                                onClick={() => onSelectOpportunity?.(opportunity)}
                                className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${selectedOpportunityIds.has(opportunity.id) ? 'ring-2 ring-primary' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <Checkbox
                                            checked={selectedOpportunityIds.has(opportunity.id)}
                                            onCheckedChange={() => {
                                                setSelectedOpportunityIds((prev) => {
                                                    const next = new Set(prev);

                                                    next.has(opportunity.id)
                                                        ? next.delete(opportunity.id)
                                                        : next.add(opportunity.id);

                                                    return next;
                                                });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStageColor(opportunity.stage)}`}>
                                                    {opportunity.stage.replace('-', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{opportunity.summary}</p>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span className="flex items-center space-x-1">
                                                    <DollarSign size={14} />
                                                    <span>{opportunity.currency} {opportunity.money.toLocaleString()}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <TrendingUp size={14} />
                                                    <span>{opportunity.confidence_score}% confidence</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <Calendar size={14} />
                                                    <span>Close: {opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString() : 'N/A'}</span>
                                                </span>
                                                {/* {opportunity.assignedTo && (
                                                    <span className="flex items-center space-x-1">
                                                        <Users size={14} />
                                                        <span>{opportunity.assignedTo}</span>
                                                    </span>
                                                )} */}
                                            </div>

                                            {/* Associated Contacts */}
                                            {opportunity.associated_contacts && opportunity.associated_contacts.length > 0 && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-gray-400">Contacts:</span>
                                                    <div className="flex items-center gap-1 flex-wrap">
                                                        {opportunity.associated_contacts.map((contact) => (
                                                            <span key={contact.email} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                                                                <Users size={10} />
                                                                {contact.name} · {contact.email}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Button className='ml-auto text-destructive' variant="ghost" onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteId(opportunity.id)
                                        }}>
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 ml-9">
                                    Source: {opportunity.source.map(s => s.source).join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                    {listviewTotalPages > 1 &&
                        <Pagination className='p-2 sticky bottom-0 bg-white'>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious onClick={() => listviewCurrentPage > 1 && setListviewCurrentPage(listviewCurrentPage - 1)} disabled={listviewCurrentPage === 1 || loading.listviewOpportunitiesLoading} />
                                </PaginationItem>
                                {getPaginationNumbers(listviewCurrentPage, listviewTotalPages).map((page, index) => (
                                    <PaginationItem key={index}>
                                        {
                                            page === "..." ? <PaginationEllipsis /> : (<PaginationLink isActive={listviewCurrentPage === page} onClick={() => setListviewCurrentPage(page)}>
                                                {page}
                                            </PaginationLink>)
                                        }
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext onClick={() => listviewCurrentPage < listviewTotalPages && setListviewCurrentPage(listviewCurrentPage + 1)} disabled={listviewCurrentPage === listviewTotalPages || loading.listviewOpportunitiesLoading} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    }
                </ScrollArea>
            </div>
            {/* <CreateOpportunityDialog open={openNewOpportunity} onOpenChange={setOpenNewOpportunity} contactName={} /> */}

            {/* Merge Dialog */}
            <OpportunityMergeDialog
                isOpen={mergeDialogOpen}
                onClose={() => setMergeDialogOpen(false)}
                selectedOpportunities={getSelectedOpportunities()}
            />
            <DeleteConfirmationDialog
                title="Delete Opportunity"
                description="Are you sure you want to delete this opportunity?"
                keyword="DELETE"
                buttonText="Delete"
                loading={loading.deletingOpportunity}
                openDeleteDialog={!!deleteId}
                handleCloseModal={() => setDeleteId(null)}
                handleDelete={() =>
                    deleteOpportunity(deleteId)
                }
            />
        </div>

    );
};

export default OpportunitiesListView;