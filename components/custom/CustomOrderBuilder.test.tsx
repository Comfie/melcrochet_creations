// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomOrderBuilder from "./CustomOrderBuilder";

afterEach(() => {
  cleanup();
});

function decodedHref() {
  const link = screen.getByRole("link", { name: /send on whatsapp/i });
  return decodeURIComponent(link.getAttribute("href")!.split("?text=")[1]);
}

describe("CustomOrderBuilder", () => {
  it("starts with a generic custom-piece request", () => {
    render(<CustomOrderBuilder pieces={["throw blanket", "hat"]} />);
    expect(decodedHref()).toBe("Hi MelCrochet! I'd like to request a custom piece.");
  });

  it("updates the WhatsApp message as the customer fills in the form", async () => {
    const user = userEvent.setup();
    render(<CustomOrderBuilder pieces={["throw blanket", "hat"]} />);

    await user.selectOptions(screen.getByLabelText(/what would you like made/i), "throw blanket");
    await user.type(screen.getByLabelText(/colours/i), "Cream and brown");

    const message = decodedHref();
    expect(message).toContain("I'd like to request a custom throw blanket.");
    expect(message).toContain("Colours: Cream and brown");
    expect(message).not.toContain("Size:");
  });
});
