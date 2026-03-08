import { Building2, ExternalLink } from "lucide-react";
import { EspoHeader } from "@/components/espo-header";

export function ConnectionRequired() {
  return (
    <div className="min-h-screen bg-background" data-testid="page-connection-required">
      <EspoHeader breadcrumbs={[{ label: "Refurb Projects" }]} />

      <div className="p-3 sm:p-5">
        <div className="border rounded-md p-8 sm:p-12 bg-card text-center max-w-lg mx-auto mt-8">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2" data-testid="text-connection-title">
            CRM Connection Required
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            This app needs to be opened from your PropertyPipeline CRM to connect to your data.
            Please navigate to an Opportunity or Lead record in your CRM and click the
            "Refurb Projects" button to launch this module.
          </p>
          <div className="border-t pt-4 mt-4">
            <p className="text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3 inline mr-1" />
              If you believe this is an error, check that the Refurb Projects integration has been
              installed in your PropertyPipeline instance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
