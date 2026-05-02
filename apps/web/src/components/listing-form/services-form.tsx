import { Checkbox, CommonFields, Field, FormSection, NumberInput, Select, TextArea } from "./shared";

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

export function ServicesForm() {
  return (
    <>
      <CommonFields priceLabel="Headline price (optional)" />
      <FormSection title="Service" cols={2}>
        <Field label="Category" required>
          <Select name="category" required defaultValue="other" options={CATEGORIES} />
        </Field>
        <Field label="Pricing model" required>
          <Select name="pricingModel" required defaultValue="hourly" options={PRICING} />
        </Field>
        <Field label="Rate amount">
          <NumberInput name="rate" min={0} step={1} />
        </Field>
        <Field label="Years of experience">
          <NumberInput name="yearsOfExperience" min={0} step={1} />
        </Field>
      </FormSection>
      <FormSection title="Service area">
        <Checkbox name="remoteAvailable" label="Available remotely" />
        <Field label="Cities or regions you serve" hint="One per line.">
          <TextArea name="serviceArea" rows={3} />
        </Field>
      </FormSection>
    </>
  );
}
