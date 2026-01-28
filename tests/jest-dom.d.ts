import '@testing-library/jest-dom';

declare module 'bun:test' {
  interface Matchers<R> {
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeEmptyDOMElement(): R;
    toBeInTheDocument(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toBeVisible(): R;
    toContainElement(element: HTMLElement | null): R;
    toContainHTML(htmlText: string): R;
    toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): R;
    toHaveAccessibleName(expectedAccessibleName?: string | RegExp): R;
    toHaveAttribute(attr: string, value?: unknown): R;
    toHaveClass(...classNames: string[]): R;
    toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: Record<string, unknown>): R;
    toHaveStyle(css: string | Record<string, unknown>): R;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
    toHaveValue(value: string | string[] | number | null): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveErrorMessage(text?: string | RegExp): R;
  }
}
