import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TokenInputProps {
  apiToken: string;
  onTokenChange: (token: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function TokenInput({ apiToken, onTokenChange, onRefresh, isLoading }: TokenInputProps) {
  return (
    <div className="flex gap-4">
      <Input
        type="password"
        placeholder="Enter API Token"
        value={apiToken}
        onChange={(e) => onTokenChange(e.target.value)}
        className="max-w-md"
      />
      <Button 
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Refresh Jobs'}
      </Button>
    </div>
  )
}