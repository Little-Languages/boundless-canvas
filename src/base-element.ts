interface CustomAttribute {
  readonly name: string;
  readonly ownerElement: Element;
  readonly value: string;
  connectedCallback(): void;
  disconnectedCallback(): void;
  changedCallback(): void;
}

export class BaseElement extends HTMLElement {
  static tagName = 'abstract-arrow';

  static register() {
    customElements.define(this.tagName, this);
  }

  static #attributesMap = new Map<string, CustomAttribute>();

  static attributeRegistry = {
    define: (name: string, customAttribute: CustomAttribute) => {
      if (!name.includes('-')) throw new Error(`Custom attribute '${name}' must include a hyphen.`);

      this.#attributesMap.set(name, customAttribute);
    },

    get: (name: string): CustomAttribute | undefined => {
      return this.#attributesMap.get(name);
    },
  };

  static get observedAttributes(): string[] {
    return Array.from(this.#attributesMap.keys());
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {}
}
