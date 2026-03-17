"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import PortsSection from "./PortsSection";
import GatesSection from "./GatesSection";
import UnitsSection from "./UnitsSection";
import TradersSection from "./TradersSection";
import TransportCompaniesSection from "./TransportCompaniesSection";
import DestinationsSection from "./DestinationsSection";

interface Props {
  ports: any[];
  gates: any[];
  units: any[];
  traders: any[];
  transportCompanies: any[];
  destinations: any[];
}

export default function SettingsClient({
  ports,
  gates,
  units,
  traders,
  transportCompanies,
  destinations,
}: Props) {
  return (
    <Tabs defaultValue="ports" className="w-full space-y-6">
      <TabsList className="bg-muted/50 p-1 flex overflow-x-auto justify-start max-w-full no-scrollbar h-auto">
        <TabsTrigger value="ports" className="whitespace-nowrap px-4">Ports</TabsTrigger>
        <TabsTrigger value="gates" className="whitespace-nowrap px-4">Gates</TabsTrigger>
        <TabsTrigger value="units" className="whitespace-nowrap px-4">Units</TabsTrigger>
        <TabsTrigger value="traders" className="whitespace-nowrap px-4">Traders</TabsTrigger>
        <TabsTrigger value="companies" className="whitespace-nowrap px-4">Transport Companies</TabsTrigger>
        <TabsTrigger value="destinations" className="whitespace-nowrap px-4">Destinations</TabsTrigger>
      </TabsList>
      
      <div className="bg-card border rounded-lg overflow-hidden">
        <TabsContent value="ports" className="m-0 p-4">
          <PortsSection initialData={ports} />
        </TabsContent>
        <TabsContent value="gates" className="m-0 p-4">
          <GatesSection initialData={gates} />
        </TabsContent>
        <TabsContent value="units" className="m-0 p-4">
          <UnitsSection initialData={units} />
        </TabsContent>
        <TabsContent value="traders" className="m-0 p-4">
          <TradersSection initialData={traders} />
        </TabsContent>
        <TabsContent value="companies" className="m-0 p-4">
          <TransportCompaniesSection initialData={transportCompanies} />
        </TabsContent>
        <TabsContent value="destinations" className="m-0 p-4">
          <DestinationsSection initialData={destinations} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
