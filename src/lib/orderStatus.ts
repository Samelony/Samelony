export type OrderStatus =
  | "new"
  | "reviewing"
  | "quoted"
  | "changes_requested"
  | "approved"
  | "manufacturing"
  | "completed";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "new",
  "reviewing",
  "quoted",
  "approved",
  "manufacturing",
  "completed",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  quoted: "Quoted",
  changes_requested: "Changes requested",
  approved: "Approved",
  manufacturing: "Manufacturing",
  completed: "Completed",
};
