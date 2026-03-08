import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initEspoContext, hasEspoConnection } from "@/lib/espo-context";
import ProjectList from "@/pages/project-list";
import ProjectDetail from "@/pages/project-detail";
import ProjectForm from "@/pages/project-form";
import NotFound from "@/pages/not-found";
import { ConnectionRequired } from "@/pages/connection-required";

initEspoContext();

function Router() {
  if (!hasEspoConnection()) {
    return <ConnectionRequired />;
  }

  return (
    <Switch>
      <Route path="/" component={ProjectList} />
      <Route path="/projects/new" component={ProjectForm} />
      <Route path="/projects/:id/edit" component={ProjectForm} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
