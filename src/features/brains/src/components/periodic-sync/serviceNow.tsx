import { usePeriodicSyncStore } from "@/store/usePeriodicSyncStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ServiceNow: React.FC = () => {
  const { serviceNowQuery, setServiceNowQuery } = usePeriodicSyncStore();

  return (
    <div className="mt-6">
      <Label htmlFor="servicenow-query" className="block text-base  mb-2">
        Enter Query
      </Label>
      <Input
        id="servicenow-query"
        type="text"
        placeholder="Enter Query"
        value={serviceNowQuery}
        onChange={(e) => setServiceNowQuery(e.target.value)}
        className="w-full"
      />
    </div>
  );
};

export default ServiceNow;
