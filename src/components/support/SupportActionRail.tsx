import { Button } from "@/components/ui/button";

interface SupportActionRailProps {
  onHuman: () => void;
  onTicket: () => void;
  onBooking: () => void;
  disabled?: boolean;
}

export function SupportActionRail({ onHuman, onTicket, onBooking, disabled }: SupportActionRailProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button type="button" variant="outline" onClick={onHuman} disabled={disabled}>
        Request Human
      </Button>
      <Button type="button" variant="outline" onClick={onTicket} disabled={disabled}>
        Create Ticket
      </Button>
      <Button type="button" variant="outline" onClick={onBooking} disabled={disabled}>
        Book Help
      </Button>
    </div>
  );
}
