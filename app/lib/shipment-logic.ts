import { shipment_containers, transit_shipments } from "@prisma/client";

export type ShipmentWithContainers = transit_shipments & {
  containers?: shipment_containers[];
};

export function calculateShipmentStatus(shipment: ShipmentWithContainers): string {
  // If explicitly delivered, keep it
  if (shipment.status === "DELIVERED") return "DELIVERED";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const arrival = shipment.arrival_date ? new Date(shipment.arrival_date) : null;
  if (arrival) arrival.setHours(0, 0, 0, 0);

  const isFuture = arrival ? arrival.getTime() > today.getTime() : false;
  const defaultState = isFuture ? "IN_TRANSIT" : "ARRIVED";

  const currentContainers = shipment.containers || [];
  const allReceived = currentContainers.length > 0 && currentContainers.every(c => c.empty_return_date);

  if (allReceived) return "FULLY_RECEIVED";

  // If it was in an "automatic" state, return the fresh calculated state
  if (["PENDING", "IN_TRANSIT", "ARRIVED", "FULLY_RECEIVED"].includes(shipment.status)) {
    return defaultState;
  }

  return shipment.status || defaultState;
}

export function calculateContainerStatus(container: Partial<shipment_containers>, shipmentArrivalDate: Date | null): string {
  if (container.empty_return_date) return "RECEIVED";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const arrival = shipmentArrivalDate ? new Date(shipmentArrivalDate) : null;
  if (arrival) arrival.setHours(0, 0, 0, 0);
  
  const isFuture = arrival ? arrival.getTime() > today.getTime() : false;
  return isFuture ? "IN_TRANSIT" : "ARRIVED";
}

export type ShipmentAlert = {
  id: string;
  type: "info" | "warning" | "critical" | "penalty";
  title: string;
  message: string;
  daysRemaining: number;
  shipmentId: number;
  blNumber: string;
};

export function getShipmentFreeTimeDetails(shipment: transit_shipments) {
  if (!shipment.arrival_date || !shipment.free_time_days) return null;

  const arrival = new Date(shipment.arrival_date);
  arrival.setHours(0, 0, 0, 0);

  const expirationDate = new Date(arrival);
  expirationDate.setDate(arrival.getDate() + (shipment.free_time_days - 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    arrivalDate: arrival,
    expirationDate: expirationDate,
    daysRemaining: diffDays,
    isExpired: diffDays < 0,
    totalFreeTime: shipment.free_time_days,
    usedDays: Math.max(0, shipment.free_time_days - diffDays),
    progress: Math.min(100, Math.max(0, ((shipment.free_time_days - diffDays) / shipment.free_time_days) * 100))
  };
}

export function generateAlertForShipment(shipment: transit_shipments): ShipmentAlert | null {
  // Only alert for active, non-delivered shipments that have arrived
  if (shipment.status === "DELIVERED" || shipment.status === "FULLY_RECEIVED" || !shipment.arrival_date) return null;

  const details = getShipmentFreeTimeDetails(shipment);
  if (!details) return null;

  const { daysRemaining, isExpired } = details;
  const blText = shipment.bl_number || `SH-${shipment.id}`;

  if (isExpired) {
    return {
      id: `penalty-${shipment.id}`,
      type: "penalty",
      title: "دخلت مرحلة الغرامات 💸",
      message: `تجاوزت بوليصة ${blText} فترة السماح بـ ${Math.abs(daysRemaining)} يوم/أيام.`,
      daysRemaining,
      shipmentId: shipment.id,
      blNumber: blText
    };
  } else if (daysRemaining === 0) {
    return {
      id: `critical-${shipment.id}`,
      type: "critical",
      title: "اليوم هو آخر يوم سماح! 🚨",
      message: `بوليصة ${blText} تنتهي فترة سماحها اليوم. يرجى التخليص فوراً.`,
      daysRemaining,
      shipmentId: shipment.id,
      blNumber: blText
    };
  } else if (daysRemaining <= 2) {
    return {
      id: `warning-${shipment.id}`,
      type: "warning",
      title: "اقتراب انتهاء المهلة ⚠️",
      message: `باقي ${daysRemaining} يوم/أيام فقط على انتهاء فترة سماح بوليصة ${blText}.`,
      daysRemaining,
      shipmentId: shipment.id,
      blNumber: blText
    };
  } else if (daysRemaining <= 5) {
      return {
          id: `info-${shipment.id}`,
          type: "info",
          title: "تنبيه اعتيادي",
          message: `باقي ${daysRemaining} يوم/أيام على انتهاء فترة سماح بوليصة ${blText}.`,
          daysRemaining,
          shipmentId: shipment.id,
          blNumber: blText
        };
  }

  return null;
}

export function getShipmentTimingDetails(shipment: transit_shipments) {
  if (!shipment.arrival_date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const arrival = new Date(shipment.arrival_date);
  arrival.setHours(0, 0, 0, 0);

  const created = new Date(shipment.createdAt);
  created.setHours(0, 0, 0, 0);

  const isArrived = today.getTime() >= arrival.getTime();

  if (!isArrived) {
    // Stage 1: In Sea (Moving towards port)
    const totalTripDuration = arrival.getTime() - created.getTime();
    const timePassed = today.getTime() - created.getTime();
    const daysRemaining = Math.max(0, Math.ceil((arrival.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Progress is based on time since record creation
    const progress = totalTripDuration > 0 
      ? Math.min(100, Math.max(0, (timePassed / totalTripDuration) * 100)) 
      : 0;

    return {
      stage: "TRANSIT",
      label: "في البحر 🚢",
      subLabel: `باقي ${daysRemaining} يوم للوصول`,
      detail: `ت. الوصول: ${arrival.toLocaleDateString("ar-SA")}`,
      progress,
      color: "blue"
    };
  } else {
    // Stage 2: At Port (Staying in port)
    const daysAtPort = Math.max(1, Math.ceil((today.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const freeTime = shipment.free_time_days || 7;
    
    // Progress is based on stay duration relative to free time
    const progress = Math.min(100, (daysAtPort / freeTime) * 100);

    return {
      stage: "PORT",
      label: "في الميناء ⚓",
      subLabel: `منذ ${daysAtPort} يوم/أيام`,
      detail: `وصلت في: ${arrival.toLocaleDateString("ar-SA")}`,
      progress,
      color: daysAtPort >= freeTime ? "rose" : daysAtPort >= freeTime - 2 ? "amber" : "indigo"
    };
  }
}
