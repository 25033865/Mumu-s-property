export const client = { name: "Thabo Molefe", company: "Waterberg Mining Co.", initials: "TM" };

export type Status =
  | "Submitted"
  | "Under Review"
  | "Quotation Sent"
  | "Approved"
  | "In Progress"
  | "Completed";

export const statusOrder: Status[] = [
  "Submitted", "Under Review", "Quotation Sent", "Approved", "In Progress", "Completed",
];

export const statusTone: Record<Status, "gray" | "amber" | "blue" | "violet" | "gold" | "green"> = {
  Submitted: "gray",
  "Under Review": "amber",
  "Quotation Sent": "blue",
  Approved: "violet",
  "In Progress": "gold",
  Completed: "green",
};

export const requests = [
  { id: "SR-2041", service: "Pumps, Valves & Electric Motors", date: "2026-09-08", status: "In Progress" as Status, location: "Grootegeluk Plant, Lephalale", urgency: "High" },
  { id: "SR-2038", service: "PPE & Safety Gear", date: "2026-09-05", status: "Completed" as Status, location: "Main Store, Onverwacht", urgency: "Medium" },
  { id: "SR-2035", service: "Maintenance Services", date: "2026-09-02", status: "Quotation Sent" as Status, location: "Workshop B", urgency: "Medium" },
  { id: "SR-2030", service: "Accommodation & Property", date: "2026-08-28", status: "Approved" as Status, location: "North Camp", urgency: "Low" },
  { id: "SR-2027", service: "Industrial & Mechanical Equipment", date: "2026-08-24", status: "Under Review" as Status, location: "Conveyor Line 4", urgency: "High" },
  { id: "SR-2019", service: "Engineering Tools & Consumables", date: "2026-08-18", status: "Submitted" as Status, location: "Central Workshop", urgency: "Low" },
];

export const quotes = [
  { id: "QT-1188", ref: "SR-2035", amount: "R 142,500", status: "Awaiting approval", date: "2026-09-06", tone: "amber" as const },
  { id: "QT-1180", ref: "SR-2030", amount: "R 486,000", status: "Approved", date: "2026-08-30", tone: "green" as const },
  { id: "QT-1174", ref: "SR-2027", amount: "R 78,200", status: "In review", date: "2026-08-25", tone: "blue" as const },
];

export const messages = [
  { from: "MUMUS Projects Team", text: "Delivery for SR-2041 scheduled for Fri 12 Sept.", time: "2h ago", unread: true },
  { from: "Sales · Naledi K.", text: "Revised quotation QT-1188 attached for approval.", time: "1d ago", unread: true },
  { from: "Support", text: "Your documents have been verified. Thank you.", time: "3d ago", unread: false },
];

export const documents = [
  { name: "Quotation_QT-1188.pdf", type: "Quote", size: "248 KB", date: "2026-09-06" },
  { name: "Delivery_Note_SR-2038.pdf", type: "Delivery", size: "112 KB", date: "2026-09-05" },
  { name: "Safety_Datasheet_PPE.pdf", type: "Compliance", size: "1.2 MB", date: "2026-09-01" },
  { name: "Master_Service_Agreement.pdf", type: "Contract", size: "640 KB", date: "2026-08-20" },
];

export const bookings = [
  { id: "AC-118", guest: "Grootegeluk Shutdown Crew", camp: "North Camp", beds: 24, checkIn: "2026-09-10", checkOut: "2026-09-24", status: "Active" as Status, tone: "gold" as const },
  { id: "AC-114", guest: "Conveyor Maintenance Team", camp: "Onverwacht Lodge", beds: 8, checkIn: "2026-09-06", checkOut: "2026-09-13", status: "In Progress" as Status, tone: "gold" as const },
  { id: "AC-109", guest: "Electrical Contractors", camp: "South Camp", beds: 12, checkIn: "2026-09-01", checkOut: "2026-09-30", status: "Approved" as Status, tone: "violet" as const },
  { id: "AC-102", guest: "Engineering Assessors", camp: "Onverwacht Lodge", beds: 4, checkIn: "2026-08-20", checkOut: "2026-08-27", status: "Completed" as Status, tone: "green" as const },
];

export const camps = [
  { name: "North Camp", allocated: 36, capacity: 60 },
  { name: "Onverwacht Lodge", allocated: 12, capacity: 40 },
  { name: "South Camp", allocated: 12, capacity: 48 },
];

export const clients = [
  { name: "Waterberg Mining Co.", contact: "Thabo Molefe", sector: "Mining", requests: 12, status: "Active" },
  { name: "Limpopo Civils (Pty) Ltd", contact: "Anele Dube", sector: "Construction", requests: 8, status: "Active" },
  { name: "Grootegeluk Processing", contact: "Riaan Botha", sector: "Manufacturing", requests: 15, status: "Active" },
  { name: "Lephalale Municipality", contact: "Sipho Nkosi", sector: "Government", requests: 5, status: "Pending" },
  { name: "Marula Estates", contact: "Chanel Pretorius", sector: "Residential", requests: 3, status: "Active" },
];
