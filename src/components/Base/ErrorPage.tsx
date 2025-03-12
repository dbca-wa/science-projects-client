import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error?: Error | null;
  resetError?: () => void;
  isSuperuser?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  resetError,
  isSuperuser = false,
}) => {
  if (isSuperuser && error) {
    console.error("Error caught by boundary:", error);
  }

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error while loading this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuperuser && error && (
            <div className="mt-0 overflow-hidden rounded-lg bg-slate-800 p-4">
              <p className="mb-2 text-sm text-slate-400">Error details:</p>
              <pre className="overflow-auto text-sm text-white">
                {error.toString()}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button
            variant="default"
            onClick={() => window.location.reload()}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorPage;
