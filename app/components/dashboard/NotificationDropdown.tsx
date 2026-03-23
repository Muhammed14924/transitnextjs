"use client";

import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Clock, ShieldAlert, Info, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import { apiClient } from "@/app/lib/api-client";
import { generateAlertForShipment, ShipmentAlert } from "@/app/lib/shipment-logic";
import { cn } from "@/app/lib/utils";
import Link from "next/link";

export function NotificationDropdown() {
  const [alerts, setAlerts] = useState<ShipmentAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const data = await apiClient.getShipments({ limit: 100 });
        if (data?.shipments) {
          const generatedAlerts = data.shipments
            .map((s: any) => generateAlertForShipment(s))
            .filter((a: any) => a !== null) as ShipmentAlert[];
          
          // Sort by urgency: Penalty > Critical > Warning > Info
          const priority = { penalty: 0, critical: 1, warning: 2, info: 3 };
          generatedAlerts.sort((a, b) => priority[a.type] - priority[b.type]);
          
          setAlerts(generatedAlerts);
        }
      } catch (error) {
        console.error("Failed to fetch notification alerts", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: ShipmentAlert["type"]) => {
    switch (type) {
      case "penalty": return <ShieldAlert className="text-rose-500" size={18} />;
      case "critical": return <AlertTriangle className="text-amber-500 animate-pulse" size={18} />;
      case "warning": return <Clock className="text-orange-400" size={18} />;
      default: return <Info className="text-blue-400" size={18} />;
    }
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:bg-slate-100 rounded-xl relative group"
        >
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          {alerts.length > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive border-2 border-white dark:border-slate-900"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[320px] md:w-[380px] mt-1 p-2 rounded-2xl border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        <DropdownMenuLabel className="flex items-center justify-between p-3">
          <span className="font-bold text-slate-900">التنبيهات اللوجستية</span>
          {alerts.length > 0 && (
            <span className="bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded-full font-bold">
              {alerts.length} تنبيه نشط
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-50" />
        
        <div className="max-h-[400px] overflow-y-auto py-1 custom-scrollbar">
          {loading && alerts.length === 0 ? (
            <div className="p-8 text-center">
               <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
               <p className="text-xs text-slate-400">جاري فحص التواريخ...</p>
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((alert) => (
              <DropdownMenuItem 
                key={alert.id}
                className="p-3 mb-1 rounded-xl focus:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all flex flex-col items-start gap-1"
              >
                <div className="flex items-center gap-2 w-full">
                  {getAlertIcon(alert.type)}
                  <span className="font-bold text-xs flex-1">{alert.title}</span>
                  <Link 
                    href="/dashboard/shipments" 
                    className="text-primary hover:bg-primary/5 p-1 rounded-md transition-colors"
                  >
                    <ExternalLink size={12} />
                  </Link>
                </div>
                <p className="text-[11px] text-slate-600 pr-6 leading-relaxed">
                  {alert.message}
                </p>
                <div className="mt-1 pr-6 w-full flex justify-between items-center">
                   <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                     BL: {alert.blNumber}
                   </span>
                   {alert.type === 'penalty' && (
                     <span className="text-[9px] font-bold text-rose-500">منذ {Math.abs(alert.daysRemaining)} يوم</span>
                   )}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-12 px-4 text-center">
              <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="text-slate-200" size={24} />
              </div>
              <p className="text-sm font-medium text-slate-400">لا توجد تنبيهات حالياً</p>
              <p className="text-[10px] text-slate-300">جميع الشحنات ضمن فترة السماح</p>
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-50" />
        <DropdownMenuItem className="p-2 rounded-xl focus:bg-primary/5 text-primary text-xs font-bold justify-center cursor-pointer">
          <Link href="/dashboard/shipments">مشاهدة جميع الشحنات</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
