// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderViaWhatsApp } from "./OrderViaWhatsApp";

afterEach(() => {
  cleanup();
});

const productUrl = "https://melcrochet-creations.vercel.app/products/lap-throw-blanket";

describe("OrderViaWhatsApp", () => {
  it("builds a WhatsApp link with just the product name when nothing is selected", () => {
    render(
      <OrderViaWhatsApp productName="Scrunchie" productUrl={productUrl} colours={[]} sizes={[]} />
    );
    const link = screen.getByRole("link", { name: /order via whatsapp/i });
    const decoded = decodeURIComponent(link.getAttribute("href")!.split("?text=")[1]);
    expect(decoded).toContain("Hi MelCrochet! I'd like to order the Scrunchie.");
    expect(decoded).not.toContain("Colour:");
    expect(decoded).not.toContain("Size:");
  });

  it("does not render a size selector for a single size, but includes it in the message", () => {
    render(
      <OrderViaWhatsApp
        productName="Lap Throw Blanket"
        productUrl={productUrl}
        colours={[]}
        sizes={["80x100cm"]}
      />
    );
    expect(screen.queryByText("Size")).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: /order via whatsapp/i });
    const decoded = decodeURIComponent(link.getAttribute("href")!.split("?text=")[1]);
    expect(decoded).toContain("Size: 80x100cm");
  });

  it("updates the WhatsApp link when a colour is selected", async () => {
    const user = userEvent.setup();
    render(
      <OrderViaWhatsApp
        productName="Lap Throw Blanket"
        productUrl={productUrl}
        colours={["Cream", "Sage Green"]}
        sizes={[]}
      />
    );

    await user.click(screen.getByRole("radio", { name: "Sage Green" }));

    const link = screen.getByRole("link", { name: /order via whatsapp/i });
    const decoded = decodeURIComponent(link.getAttribute("href")!.split("?text=")[1]);
    expect(decoded).toContain("Colour: Sage Green");
  });

  it("shows a hint to pick a colour until one is selected", () => {
    render(
      <OrderViaWhatsApp
        productName="Lap Throw Blanket"
        productUrl={productUrl}
        colours={["Cream"]}
        sizes={[]}
      />
    );
    expect(screen.getByText(/pick a colour above/i)).toBeInTheDocument();
  });
});
