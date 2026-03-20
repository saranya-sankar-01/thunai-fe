import { useState } from 'react';
import { Grid3X3, List, ArrowUpDown, SortAsc, SortDesc, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface KnowledgeControlsProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: 'date' | 'title' | 'views' | 'insights';
  onSortByChange: (sort: 'date' | 'title' | 'views' | 'insights') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  filter: string;
  totalCount: number;
}

export const KnowledgeControls = ({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  filter,
  totalCount
}: KnowledgeControlsProps) => {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-card/50 rounded-lg border border-card-border">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-medium">
            {totalCount} {filter === 'all' ? 'items' : filter}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="views">Views</SelectItem>
              <SelectItem value="insights">Insights</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">View:</span>
        <div className="flex border border-card-border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="border-0 rounded-r-none"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="border-0 rounded-l-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};