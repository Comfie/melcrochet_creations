// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), refresh: vi.fn() }));
const category = { id: "cat", name: "Bags", slug: "bags" };
const base = { slug: "piece", description: "Handmade", priceType: "QUOTE", price: null, currency: "ZAR", sizes: null, colours: null, leadTime: null, careInstructions: null, imageUrl: null, imagePublicId: null, gallery: [], featured: false, sortOrder: 0, categoryId: "cat", category };
vi.mock("@/hooks/use-api-list", () => ({ useApiList: (url: string) => ({ data: url === "/api/products" ? [{ ...base, id: "live", name: "Live piece", isActive: true }, { ...base, id: "hidden", name: "Hidden piece", isActive: false }] : [category], loading: false, error: null, refresh: mocks.refresh }) }));
vi.mock("@/hooks/use-api-mutation", () => ({ useApiMutation: () => ({ mutate: mocks.mutate, loading: false }) }));
vi.mock("@/hooks/use-launch-params", () => ({ useLaunchParams: vi.fn() }));
vi.mock("@/components/admin/SlideOver", () => ({ default: ({ open, children, footer }: { open: boolean; children: ReactNode; footer: ReactNode }) => open ? <section>{children}{footer}</section> : null }));
import ProductsPage from "./page";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("product removal controls", () => {
  it("starts with live products and keeps hidden products behind their filter", async () => {
    const user = userEvent.setup();
    render(<ProductsPage />);
    expect(screen.getByRole("button", { name: /Live piece/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hidden piece/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Hidden/ }));
    expect(screen.getByRole("button", { name: /Hidden piece/ })).toBeInTheDocument();
  });

  it("requires confirmation before permanently deleting a hidden product", async () => {
    const user = userEvent.setup();
    render(<ProductsPage />);
    await user.click(screen.getByRole("button", { name: /^Hidden/ }));
    await user.click(screen.getByRole("button", { name: /Hidden piece/ }));
    await user.click(screen.getByRole("button", { name: "Delete permanently" }));
    expect(mocks.mutate).not.toHaveBeenCalled();
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("cannot be restored");
    await user.click(within(dialog).getByRole("button", { name: "Delete permanently" }));
    expect(mocks.mutate).toHaveBeenCalledWith("/api/products/hidden?permanent=true", expect.objectContaining({ method: "DELETE" }));
  });

  it("offers hiding, rather than permanent deletion, for live products", async () => {
    const user = userEvent.setup();
    render(<ProductsPage />);
    await user.click(screen.getByRole("button", { name: /Live piece/ }));
    expect(screen.getByRole("button", { name: "Hide product" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete permanently" })).not.toBeInTheDocument();
  });
});
