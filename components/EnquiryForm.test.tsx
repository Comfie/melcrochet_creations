// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EnquiryForm from "./EnquiryForm";

// vitest.config.ts does not set `test.globals: true` (project convention is
// explicit imports), so @testing-library/react's automatic afterEach
// cleanup — which only registers when it detects a global `afterEach` — never
// fires. Call it explicitly here, scoped to this file, or DOM nodes from one
// test leak into the next (e.g. two "Send Message" buttons on screen).
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("EnquiryForm", () => {
  it("shows a validation error when name and message are empty", async () => {
    const user = userEvent.setup();
    render(<EnquiryForm />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please fill in your name and message."
    );
  });

  it("submits successfully and shows the success message", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "1", status: "NEW" }), { status: 201 })
    );
    const user = userEvent.setup();
    render(<EnquiryForm />);

    await user.type(screen.getByLabelText(/^name$/i), "Vitest Tester");
    await user.type(screen.getByLabelText(/message/i), "Do you make custom colours?");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/thank you/i);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/enquiries",
      expect.objectContaining({ method: "POST" })
    );
    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse((requestInit as RequestInit).body as string);
    expect(body.name).toBe("Vitest Tester");
    expect(body.website).toBe("");
  });

  it("shows the server's error message when the API rejects the request", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Too many requests, please try again later" }), {
        status: 429,
      })
    );
    const user = userEvent.setup();
    render(<EnquiryForm />);

    await user.type(screen.getByLabelText(/^name$/i), "Vitest Tester");
    await user.type(screen.getByLabelText(/message/i), "Hello");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/too many requests/i);
  });
});
