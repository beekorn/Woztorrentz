import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { OMDBService } from '@/services/omdbApi';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export const ApiKeySetup = ({ onApiKeySet }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    
    try {
      const isValid = await OMDBService.testApiKey(apiKey);
      
      if (isValid) {
        OMDBService.saveApiKey(apiKey);
        toast({
          title: "Success!",
          description: "OMDB API key validated and saved successfully",
        });
        onApiKeySet();
      } else {
        toast({
          title: "Invalid API Key",
          description: "Please check your OMDB API key and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: "Could not validate API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Setup OMDB API Key</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Important:</strong> Storing API keys in localStorage is not the most secure method. 
              For production apps, consider using Supabase for secure secret management.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                To use real movie data, you need an OMDB API key:
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Visit <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary underline"
                  onClick={() => window.open('http://www.omdbapi.com/apikey.aspx', '_blank')}
                >
                  OMDB API <ExternalLink className="w-3 h-3 inline ml-1" />
                </Button></li>
                <li>Register for a free API key</li>
                <li>Enter your API key below</li>
              </ol>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OMDB API key"
                className="font-mono"
                required
              />
              
              <Button 
                type="submit" 
                disabled={isValidating || !apiKey.trim()}
                className="w-full"
              >
                {isValidating ? "Validating..." : "Validate & Save API Key"}
              </Button>
            </form>
            
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => window.open('https://docs.lovable.dev/supabase/overview', '_blank')}
                className="text-sm text-muted-foreground"
              >
                Learn about Supabase integration <ExternalLink className="w-3 h-3 inline ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};