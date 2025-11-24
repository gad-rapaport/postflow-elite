import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Sparkles, Loader2, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SettingsDialog from "@/components/SettingsDialog";

const DEMO_POSTS = {
  linkedin: {
    title: "How I 10x'd My Productivity in 30 Days",
    content: `After years of struggling with productivity, I discovered 3 game-changing strategies:

✅ Time-blocking (not task lists)
✅ The 2-minute rule for small tasks
✅ Batch processing similar work

The result? I went from working 12-hour days to 6-hour days while getting MORE done.

Here's the breakdown of each strategy...

[Thread continues...]

What's your #1 productivity hack? Drop it below 👇`,
  },
  twitter: {
    title: "The productivity framework that changed my life",
    content: `I used to work 12 hours a day and accomplish nothing.

Now I work 6 hours and 10x my output.

The secret? 3 simple rules:

1. Time-blocking (not task lists)
2. 2-minute rule for quick wins
3. Batch similar tasks

Thread 🧵👇`,
  },
};

export default function PostFlow() {
  const [rawIdea, setRawIdea] = useState("");
  const [platform, setPlatform] = useState<"linkedin" | "twitter">("linkedin");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{ title: string; content: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleGenerate = async () => {
    if (!rawIdea.trim()) {
      toast({
        title: "Please enter an idea",
        description: "Type something in the Raw Idea field to generate a post.",
        variant: "destructive",
      });
      return;
    }

    // Check for API key
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key in Settings first.",
        variant: "destructive",
      });
      setSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedPost(null);

    try {
      const platformContext = platform === "linkedin" 
        ? "LinkedIn (professional, educational, with emojis and formatting for engagement)"
        : "Twitter (concise, punchy, thread format with emojis)";

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a viral social media content creator. Create engaging, authentic posts optimized for ${platformContext}. 
              
Format your response as JSON with two fields:
- "title": A compelling headline (max 100 chars)
- "content": The full post body with proper formatting, emojis, and structure for the platform

Make it feel human, relatable, and shareable.`
            },
            {
              role: "user",
              content: `Create a viral ${platform} post based on this idea: ${rawIdea}`
            }
          ],
          temperature: 0.9,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      
      // Parse the JSON response
      try {
        const parsed = JSON.parse(generatedText);
        setGeneratedPost({
          title: parsed.title || "Generated Post",
          content: parsed.content || generatedText,
        });
        toast({
          title: "Post Generated! 🎉",
          description: "Your viral post is ready to copy.",
        });
      } catch {
        // Fallback if AI doesn't return valid JSON
        setGeneratedPost({
          title: "Generated Post",
          content: generatedText,
        });
        toast({
          title: "Post Generated! 🎉",
          description: "Your viral post is ready to copy.",
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate post. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedPost) {
      navigator.clipboard.writeText(`${generatedPost.title}\n\n${generatedPost.content}`);
      toast({
        title: "Copied to clipboard! ✨",
        description: "Your post is ready to share.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50 animate-pulse-slow" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 glass">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-glow" />
            <h1 className="text-2xl font-bold gradient-text">PostFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">
              Create viral posts in seconds
            </p>
            <Button
              onClick={() => setSettingsOpen(true)}
              variant="glass"
              size="icon"
              className="shrink-0"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Input */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">
                Turn Ideas Into
                <span className="gradient-text"> Viral Posts</span>
              </h2>
              <p className="text-muted-foreground">
                Transform your raw thoughts into engaging social media content
              </p>
            </div>

            <div className="glass rounded-2xl p-6 space-y-6 shadow-premium">
              <div className="space-y-2">
                <label className="text-sm font-medium">Raw Idea</label>
                <Textarea
                  placeholder="E.g., I learned how to be more productive by time-blocking my day..."
                  value={rawIdea}
                  onChange={(e) => setRawIdea(e.target.value)}
                  className="min-h-[200px] resize-none glass border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select value={platform} onValueChange={(value) => setPlatform(value as "linkedin" | "twitter")}>
                  <SelectTrigger className="glass border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="premium"
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Post
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Preview</h2>
              <p className="text-muted-foreground">Your generated post will appear here</p>
            </div>

            <div className="glass rounded-2xl p-6 min-h-[400px] shadow-premium relative">
              {!generatedPost && !isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary/50" />
                    </div>
                    <p className="text-muted-foreground">
                      Enter an idea and click Generate to see your viral post
                    </p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                    <div className="space-y-2">
                      <p className="font-medium">Creating your viral post...</p>
                      <p className="text-sm text-muted-foreground">
                        Analyzing trends and optimizing engagement
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {generatedPost && !isGenerating && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold gradient-text">{generatedPost.title}</h3>
                    <Button onClick={handleCopy} variant="glass" size="icon" className="shrink-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                      {generatedPost.content}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      ✨ Generated for {platform === "linkedin" ? "LinkedIn" : "Twitter"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
