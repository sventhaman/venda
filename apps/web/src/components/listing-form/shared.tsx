import { Checkbox, Field, FormSection, NumberInput, Select, TextArea, TextInput } from "./fields";
import { ImageUploader } from "./image-uploader";
import { SubmitButton } from "@/components/submit-button";

const CURRENCIES: Array<[string, string]> = [
  ["NOK", "NOK"],
  ["USD", "USD"],
  ["EUR", "EUR"],
  ["GBP", "GBP"],
  ["SEK", "SEK"],
  ["DKK", "DKK"],
];

export type ListingFormDefaults = {
  title?: string;
  description?: string;
  priceAmount?: number;
  currency?: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  images?: Array<{ url: string }>;
  // Vertical-specific fields live under details — typed loosely so the same
  // shape works for goods/cars/realestate/jobs/services without TS gymnastics.
  details?: Record<string, unknown>;
};

export function CommonFields({
  priceLabel = "Price",
  defaults,
}: {
  priceLabel?: string;
  defaults?: ListingFormDefaults;
}) {
  return (
    <>
      <FormSection title="Basics">
        <Field label="Title" required>
          <TextInput
            name="title"
            required
            minLength={3}
            maxLength={200}
            defaultValue={defaults?.title}
          />
        </Field>
        <Field label="Description" hint="Optional. Up to 20,000 characters.">
          <TextArea
            name="description"
            rows={6}
            maxLength={20000}
            defaultValue={defaults?.description}
          />
        </Field>
      </FormSection>

      <FormSection title={priceLabel} cols={2}>
        <Field label="Amount" hint="Whole units (no cents).">
          <NumberInput name="priceAmount" min={0} step={1} defaultValue={defaults?.priceAmount} />
        </Field>
        <Field label="Currency">
          <Select
            name="currency"
            defaultValue={defaults?.currency ?? "NOK"}
            options={CURRENCIES}
          />
        </Field>
      </FormSection>

      <FormSection title="Location" cols={2}>
        <Field label="Country (ISO-2)" hint="e.g. NO, US, GB">
          <TextInput name="country" maxLength={2} defaultValue={defaults?.country} />
        </Field>
        <Field label="Region">
          <TextInput name="region" defaultValue={defaults?.region} />
        </Field>
        <Field label="City">
          <TextInput name="city" defaultValue={defaults?.city} />
        </Field>
        <Field label="Postal code">
          <TextInput name="postalCode" defaultValue={defaults?.postalCode} />
        </Field>
      </FormSection>

      <FormSection title="Photos">
        <ImageUploader name="images" initial={defaults?.images} />
      </FormSection>
    </>
  );
}

export function SubmitBar({
  vertical,
  mode = "create",
}: {
  vertical: string;
  mode?: "create" | "edit";
}) {
  const label = mode === "edit" ? "Save changes" : `Publish ${vertical} listing`;
  const pendingLabel = mode === "edit" ? "Saving…" : "Publishing…";
  const hint =
    mode === "edit"
      ? "Saving updates the listing immediately."
      : "Submitting publishes immediately. You can edit or unpublish anytime.";
  return (
    <div className="sticky bottom-0 -mx-6 mt-10 border-t border-ink-line bg-white/90 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <p className="text-xs text-ink-mute">{hint}</p>
        <SubmitButton pendingLabel={pendingLabel}>{label}</SubmitButton>
      </div>
    </div>
  );
}

export { Field, FormSection, NumberInput, Select, TextArea, TextInput, Checkbox };
