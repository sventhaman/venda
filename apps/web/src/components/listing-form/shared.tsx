import { Checkbox, Field, FormSection, NumberInput, Select, TextArea, TextInput } from "./fields";

const CURRENCIES: Array<[string, string]> = [
  ["NOK", "NOK"],
  ["USD", "USD"],
  ["EUR", "EUR"],
  ["GBP", "GBP"],
  ["SEK", "SEK"],
  ["DKK", "DKK"],
];

export function CommonFields({ priceLabel = "Price" }: { priceLabel?: string }) {
  return (
    <>
      <FormSection title="Basics">
        <Field label="Title" required>
          <TextInput name="title" required minLength={3} maxLength={200} />
        </Field>
        <Field label="Description" hint="Optional. Up to 20,000 characters.">
          <TextArea name="description" rows={6} maxLength={20000} />
        </Field>
      </FormSection>

      <FormSection title={priceLabel} cols={2}>
        <Field label="Amount" hint="Whole units (no cents).">
          <NumberInput name="priceAmount" min={0} step={1} />
        </Field>
        <Field label="Currency">
          <Select name="currency" defaultValue="NOK" options={CURRENCIES} />
        </Field>
      </FormSection>

      <FormSection title="Location" cols={2}>
        <Field label="Country (ISO-2)" hint="e.g. NO, US, GB">
          <TextInput name="country" maxLength={2} />
        </Field>
        <Field label="Region">
          <TextInput name="region" />
        </Field>
        <Field label="City">
          <TextInput name="city" />
        </Field>
        <Field label="Postal code">
          <TextInput name="postalCode" />
        </Field>
      </FormSection>

      <FormSection title="Photos">
        <Field label="Image URLs" hint="One per line. Real upload UI coming soon.">
          <TextArea name="images" rows={4} placeholder="https://..." />
        </Field>
      </FormSection>
    </>
  );
}

export function SubmitBar({ vertical }: { vertical: string }) {
  return (
    <div className="sticky bottom-0 -mx-6 mt-10 border-t border-ink-line bg-white/90 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <p className="text-xs text-ink-mute">
          Submitting publishes immediately. You can edit or unpublish anytime.
        </p>
        <button
          type="submit"
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-ink-soft"
        >
          Publish {vertical} listing
        </button>
      </div>
    </div>
  );
}

export { Field, FormSection, NumberInput, Select, TextArea, TextInput, Checkbox };
