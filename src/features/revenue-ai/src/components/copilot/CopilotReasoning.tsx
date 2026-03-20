import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Message } from "../../pages/Copilot";
import { EvidenceCard } from "./EvidenceCard";
import { Progress } from "@/components/ui/progress";

type CopilotReasoningProps = {
  message: Message;
};

export const CopilotReasoning = ({ message }: CopilotReasoningProps) => {
  if (!message.reasoning) return null;

  const { evidence, factors, comparative, counterfactual, auditTrail } = message.reasoning;

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Reasoning</h2>
          <p className="text-xs text-muted-foreground">{auditTrail}</p>
        </div>

        <Separator />

        {/* Evidence Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Evidence</h3>
          {evidence.map((item) => (
            <EvidenceCard key={item.id} evidence={item} />
          ))}
        </div>

        <Separator />

        {/* Factors & Weights */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Key Factors</h3>
          {factors.map((factor, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{factor.name}</span>
                <Badge variant={factor.weight < 0 ? "destructive" : "secondary"}>
                  {factor.weight > 0 ? "+" : ""}{factor.weight.toFixed(2)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{factor.rationale}</p>
              <Progress 
                value={Math.abs(factor.weight) * 100} 
                className="h-1"
              />
            </div>
          ))}
        </div>

        {/* Comparative Pattern */}
        {comparative && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Comparative Pattern</h3>
              <div className="bg-muted rounded-lg p-3 space-y-1">
                <p className="text-sm text-foreground">{comparative.metric}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground">
                    {comparative.current}d
                  </span>
                  <span className="text-sm text-muted-foreground">
                    vs {comparative.mean}d mean
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {comparative.percentile}th percentile
                </p>
              </div>
            </div>
          </>
        )}

        {/* Counterfactual */}
        {counterfactual && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">What would change my mind</h3>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-foreground">{counterfactual}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};
