import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { OrderStatus } from "./orderStatus";

export type { OrderStatus } from "./orderStatus";
export { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "./orderStatus";

export type DesignBrief = {
  summary: string;
  category: string;
  suggestedMaterials: string[];
  estimatedDimensions: string;
  style: string;
  complexity: "simple" | "moderate" | "complex";
  clarifyingQuestions: string[];
};

export type Quote = {
  manufacturingCost: number;
  materialsCost: number;
  laborCost: number;
  deliveryCost: number;
  margin: number;
  total: number;
  estimatedProductionDays: number;
  depositAmount: number;
  depositPaid: boolean;
  notes?: string;
  createdAt: string;
};

export type ProductionUpdate = {
  id: string;
  note: string;
  photoUrls: string[];
  createdAt: string;
};

export type CustomerResponse = {
  decision: "approved" | "changes_requested";
  message?: string;
  createdAt: string;
};

export type Order = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  furnitureType: string;
  dimensions: string;
  materials: string;
  budget: string;
  description: string;
  referenceFileUrls: string[];
  aiBrief?: DesignBrief;
  quote?: Quote;
  customerResponses: CustomerResponse[];
  productionUpdates: ProductionUpdate[];
};

export type NewOrderInput = {
  customerName: string;
  customerEmail: string;
  furnitureType: string;
  dimensions: string;
  materials: string;
  budget: string;
  description: string;
  referenceFileUrls: string[];
  aiBrief?: DesignBrief;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "orders.json");

async function readAll(): Promise<Order[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(orders: Order[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export async function listOrders(): Promise<Order[]> {
  const all = await readAll();
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const all = await readAll();
  return all.find((o) => o.id === id);
}

export async function createOrder(
  input: NewOrderInput,
  id: string = randomUUID()
): Promise<Order> {
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
    status: "new",
    customerResponses: [],
    productionUpdates: [],
  };
  const all = await readAll();
  all.push(order);
  await writeAll(all);
  return order;
}

async function updateOrder(
  id: string,
  mutate: (order: Order) => void
): Promise<Order> {
  const all = await readAll();
  const order = all.find((o) => o.id === id);
  if (!order) throw new Error(`Order ${id} not found`);
  mutate(order);
  order.updatedAt = new Date().toISOString();
  await writeAll(all);
  return order;
}

export async function setOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  return updateOrder(id, (order) => {
    order.status = status;
  });
}

export async function setOrderQuote(
  id: string,
  quote: Omit<Quote, "createdAt" | "depositPaid" | "total"> & {
    total?: number;
  }
): Promise<Order> {
  return updateOrder(id, (order) => {
    const total =
      quote.total ??
      quote.manufacturingCost +
        quote.materialsCost +
        quote.laborCost +
        quote.deliveryCost +
        quote.margin;
    order.quote = {
      ...quote,
      total,
      depositPaid: order.quote?.depositPaid ?? false,
      createdAt: new Date().toISOString(),
    };
    order.status = "quoted";
  });
}

export async function addCustomerResponse(
  id: string,
  response: Omit<CustomerResponse, "createdAt">
): Promise<Order> {
  return updateOrder(id, (order) => {
    order.customerResponses.push({
      ...response,
      createdAt: new Date().toISOString(),
    });
    order.status =
      response.decision === "approved" ? "approved" : "changes_requested";
  });
}

export async function markDepositPaid(id: string): Promise<Order> {
  return updateOrder(id, (order) => {
    if (order.quote) order.quote.depositPaid = true;
  });
}

export async function addProductionUpdate(
  id: string,
  update: { note: string; photoUrls: string[] }
): Promise<Order> {
  return updateOrder(id, (order) => {
    order.productionUpdates.push({
      id: randomUUID(),
      note: update.note,
      photoUrls: update.photoUrls,
      createdAt: new Date().toISOString(),
    });
    if (order.status === "approved") order.status = "manufacturing";
  });
}
