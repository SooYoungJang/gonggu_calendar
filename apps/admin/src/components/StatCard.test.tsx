import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Total Users" value={42} />);
    expect(screen.getByText("Total Users")).toBeTruthy();
    expect(screen.getByText("42")).toBeTruthy();
  });

  it("renders value as 0 when provided", () => {
    render(<StatCard label="Empty Count" value={0} />);
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("renders with an icon when provided", () => {
    const Icon = () => <svg data-testid="test-icon" />;
    render(<StatCard label="With Icon" value={10} icon={<Icon />} />);
    expect(screen.getByTestId("test-icon")).toBeTruthy();
  });

  it("renders with a color class for styling", () => {
    const Icon = () => <svg data-testid="styled-icon" />;
    const { container } = render(
      <StatCard label="Styled" value={5} icon={<Icon />} color="#ff6b6b" />
    );
    expect(container.querySelector("[data-color]")).toBeTruthy();
  });
});
