import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { connectWallet } from "../authSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPrompt({ isOpen, onClose }: LoginPromptProps) {
  const dispatch = useAppDispatch();
  const { isConnecting, loading } = useAppSelector((state) => state.auth);

  const handleConnect = async () => {
    await dispatch(connectWallet());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            Connect your wallet to authenticate and access this feature.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500 text-center">
              To proceed, please connect your Ethereum wallet. This will allow you to securely
              authenticate with our platform using your blockchain wallet.
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || loading}
              className="w-full"
            >
              {isConnecting || loading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 