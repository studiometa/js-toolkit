# Form validation

A form component with real-time field validation, error messages, and submit handling. This example demonstrates refs, event handlers on child elements, options, and the component lifecycle.

## What we're building

A contact form with name, email, and message fields. Each field validates in real time as the user types (on `input` events). Error messages appear below invalid fields. The form prevents submission until all fields pass validation.

## HTML markup

Each field group includes an input and an error message element. Array refs (`fields[]` and `errors[]`) let the component iterate over them. The form itself is the component root:

```html
<form data-component="FormValidation" novalidate>
  <div>
    <label for="name">Name</label>
    <input
      data-ref="fields[]"
      id="name"
      type="text"
      name="name"
      required
      data-rules="required|minLength:2"
    />
    <span data-ref="errors[]" class="error" aria-live="polite"></span>
  </div>

  <div>
    <label for="email">Email</label>
    <input
      data-ref="fields[]"
      id="email"
      type="email"
      name="email"
      required
      data-rules="required|email"
    />
    <span data-ref="errors[]" class="error" aria-live="polite"></span>
  </div>

  <div>
    <label for="message">Message</label>
    <textarea
      data-ref="fields[]"
      id="message"
      name="message"
      required
      data-rules="required|minLength:10"
    ></textarea>
    <span data-ref="errors[]" class="error" aria-live="polite"></span>
  </div>

  <button data-ref="submitBtn" type="submit">Send</button>
</form>
```

Add basic styles for error states:

```css
.error {
  color: red;
  font-size: 0.875rem;
  min-height: 1.25rem;
  display: block;
}

input:invalid,
textarea:invalid {
  border-color: red;
}
```

## JavaScript component

The component validates each field on `input` events using rules defined in `data-rules`. The `on<Ref><Event>` pattern with array refs receives the `index` so we know which field triggered the event:

```js
import { Base } from '@studiometa/js-toolkit';

export default class FormValidation extends Base {
  static config = {
    name: 'FormValidation',
    refs: ['fields[]', 'errors[]', 'submitBtn'],
  };

  /**
   * Validation rules — each function returns an error message or empty string.
   */
  rules = {
    required: (value) =>
      value.trim() === '' ? 'This field is required.' : '',

    email: (value) =>
      value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? 'Please enter a valid email address.'
        : '',

    minLength: (value, min) =>
      value.length > 0 && value.length < Number(min)
        ? `Must be at least ${min} characters.`
        : '',
  };

  /**
   * Validate a single field by index. Returns true if valid.
   */
  validateField(index) {
    const field = this.$refs.fields[index];
    const errorEl = this.$refs.errors[index];
    const rulesAttr = field.dataset.rules || '';
    let errorMessage = '';

    for (const rule of rulesAttr.split('|')) {
      if (!rule) continue;
      const [name, ...params] = rule.split(':');
      const validator = this.rules[name];
      if (validator) {
        errorMessage = validator(field.value, ...params);
        if (errorMessage) break;
      }
    }

    errorEl.textContent = errorMessage;
    field.setAttribute('aria-invalid', String(!!errorMessage));
    return !errorMessage;
  }

  /**
   * Validate on each input event (real-time feedback).
   * The `index` tells us which field in the array triggered the event.
   */
  onFieldsInput({ index }) {
    this.validateField(index);
  }

  /**
   * Also validate when a field loses focus.
   */
  onFieldsBlur({ index }) {
    this.validateField(index);
  }

  /**
   * Intercept form submission on the root element.
   */
  onSubmit({ event }) {
    event.preventDefault();

    // Validate all fields
    const results = this.$refs.fields.map((_, i) => this.validateField(i));
    const allValid = results.every(Boolean);

    if (allValid) {
      // Collect form data
      const formData = new FormData(this.$el);
      const data = Object.fromEntries(formData.entries());
      console.log('Form submitted:', data);

      // Reset the form
      this.$el.reset();
      this.$refs.errors.forEach((el) => { el.textContent = ''; });
    }
  }
}
```

## App setup

```js
import { registerComponent } from '@studiometa/js-toolkit';
import FormValidation from './FormValidation.js';

registerComponent(FormValidation);
```

## Further reading

- [Refs guide](/guide/introduction/managing-refs.html) — array refs with `[]` suffix
- [Events guide](/guide/introduction/working-with-events.html) — `on<Ref><Event>` handlers and the `index` parameter
- [Base class API](/api/) — `$el`, `$refs`, and instance properties
