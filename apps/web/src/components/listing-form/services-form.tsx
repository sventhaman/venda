import {
  Checkbox,
  CommonFields,
  Field,
  FormSection,
  NumberInput,
  Select,
  TextArea,
  type ListingFormDefaults,
} from "./shared";

const CATEGORIES: Array<[string, string]> = [
  ["home_repair", "Home repair"],
  ["cleaning", "Cleaning"],
  ["moving", "Moving"],
  ["tutoring", "Tutoring"],
  ["design", "Design"],
  ["development", "Development"],
  ["writing", "Writing"],
  ["marketing", "Marketing"],
  ["consulting", "Consulting"],
  ["health_wellness", "Health & wellness"],
  ["events", "Events"],
  ["transportation", "Transportation"],
  ["other", "Other"],
];

const PRICING: Array<[string, string]> = [
  ["hourly", "Hourly"],
  ["fixed", "Fixed price"],
  ["daily", "Daily"],
  ["project", "Per project"],
  ["quote_only", "Quote only"],
];

export function ServicesForm({ defaults }: { defaults?: ListingFormDefaults }) {
  const d = (defaults?.details ?? {}) as Record<string, any>;
  return (
    <>
      <CommonFields priceLabel="Headline price (optional)" defaults={defaults} />
      <FormSection title="Service" cols={2}>
        <Field label="Category" required>
          <Select name="category" required defaultValue={d.category ?? "other"} options={CATEGORIES} />
        </Field>
        <Field label="Pricing model" required>
          <Select name="pricingModel" required defaultValue={d.pricingModel ?? "hourly"} options={PRICING} />
        </Field>
        <Field label="Rate amount">
          <NumberInput name="rate" min={0} step={1} defaultValue={d.rate?.amount} />
        </Field>
        <Field label="Years of experience">
          <NumberInput name="yearsOfExperience" min={0} step={1} defaultValue={d.yearsOfExperience} />
        </Field>
      </FormSection>
      <FormSection title="Service area">
        <Checkbox name="remoteAvailable" label="Available remotely" defaultChecked={!!d.remoteAvailable} />
        <Field label="Cities or regions you serve" hint="One per line.">
          <TextArea name="serviceArea" rows={3} defaultValue={Array.isArray(d.serviceArea) ? d.serviceArea.join("\n") : undefined} />
        </Field>
      </FormSection>
    </>
  );
}
