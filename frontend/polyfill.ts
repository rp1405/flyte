// Polyfill DOMException for environments where it is missing (like React Native/Hermes)
if (typeof globalThis.DOMException === "undefined") {
  const CustomDOMException = class extends Error {
    code: number;
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? "Error";
      this.code = 0;
    }
  };
  (globalThis as any).DOMException = CustomDOMException;
}
