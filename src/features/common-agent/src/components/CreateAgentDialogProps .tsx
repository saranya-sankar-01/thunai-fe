import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus } from "lucide-react"

interface CreateAgentDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  agentName: string
  setAgentName: (name: string) => void
  isCreating: boolean
  handleCreateAgent: () => void
  triggerText?: string
  triggerClassName?: string
}

export function CreateAgentDialog({
  isOpen,
  setIsOpen,
  agentName,
  setAgentName,
  isCreating,
  handleCreateAgent,
  triggerText = "Create New Agent",
  triggerClassName = "bg-thunai-primary hover:bg-thunai-primary-light text-white"
}: CreateAgentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          <Plus className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input
              id="agent-name"
              placeholder="Enter agent name..."
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  handleCreateAgent()
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setAgentName("")
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={isCreating || !agentName.trim()}
              className="bg-thunai-primary hover:bg-thunai-primary-light text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
