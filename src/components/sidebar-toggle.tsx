import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export const SidebarToggle = ({ isOpen, onToggle }: SidebarToggleProps) => {
  return (
    <Button
      onClick={onToggle}
      size="icon"
      className="fixed top-1/2 -translate-y-1/2 right-4 z-30 rounded-full shadow-lg"
      variant="default"
    >
      {isOpen ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </Button>
  )
}