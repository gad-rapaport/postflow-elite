import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load API key from localStorage when dialog opens
    if (open) {
      const savedKey = localStorage.getItem("google_api_key");
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [open]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google API key.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation - Google keys start with "AIza"
    if (!apiKey.startsWith("AIza")) {
      toast({
        title: "Invalid API Key",
        description: "Google API keys typically start with 'AIza'.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("google_api_key", apiKey);
    toast({
      title: "Settings Saved! ✓",
      description: "Your API key has been saved securely in your browser.",
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    localStorage.removeItem("google_api_key");
    setApiKey("");
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your Google API key to enable post generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium">
              Google API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="glass border-border/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
              <br />
              Get your key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} variant="premium" className="flex-1">
              Save Settings
            </Button>
            <Button onClick={handleClear} variant="outline" className="glass border-border/50">
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
