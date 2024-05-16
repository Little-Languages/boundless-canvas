export class CustomAttribute {
  constructor(readonly ownerElement: Element, readonly name: string) {}

  // @ts-ignore
  connectedCallback(value: string): void {}

  disconnectedCallback(): void {}

  // @ts-ignore
  changedCallback(oldValue: string, newValue: string): void {}
}

type CustomAttributeConstructor = typeof CustomAttribute;

export class AttributeRegistry {
  _attributesMap = new Map<string, CustomAttributeConstructor>();

  define(name: string, customAttribute: CustomAttributeConstructor) {
    if (!name.includes('-')) throw new Error(`Custom attribute '${name}' must include a hyphen.`);

    this._attributesMap.set(name, customAttribute);
  }

  get(name: string): CustomAttributeConstructor | undefined {
    return this._attributesMap.get(name);
  }
}

export class BaseElement extends HTMLElement {
  static tagName = 'base-element';

  static register() {
    customElements.define(this.tagName, this);
  }

  static attributeRegistry = new AttributeRegistry();

  static get observedAttributes(): string[] {
    return Array.from(this.attributeRegistry._attributesMap.keys());
  }

  get #attributeRegistry() {
    return (this.constructor as typeof BaseElement).attributeRegistry;
  }

  #attributes = new Map<string, CustomAttribute>();

  disconnectedCallback() {
    this.#attributes.forEach((customAttribute) => customAttribute.disconnectedCallback());
    this.#attributes.clear();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    let customAttribute = this.#attributes.get(name);

    if (customAttribute === undefined) {
      const attributeConstructor = this.#attributeRegistry.get(name);

      if (attributeConstructor === undefined) return;

      customAttribute = new attributeConstructor(this, name);
      this.#attributes.set(name, customAttribute);
    }

    if (oldValue === null) {
      customAttribute.connectedCallback(newValue!);
    } else if (newValue === null) {
      customAttribute.disconnectedCallback();
      this.#attributes.delete(name);
    } else {
      customAttribute.changedCallback(oldValue, newValue);
    }
  }
}
