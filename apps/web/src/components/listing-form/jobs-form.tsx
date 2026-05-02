import { CommonFields, Field, FormSection, NumberInput, Select, TextArea, TextInput } from "./shared";

const EMPLOYMENT: Array<[string, string]> = [
  ["full_time", "Full time"],
  ["part_time", "Part time"],
  ["contract", "Contract"],
  ["temporary", "Temporary"],
  ["internship", "Internship"],
  ["freelance", "Freelance"],
  ["volunteer", "Volunteer"],
];

const ARRANGEMENT: Array<[string, string]> = [
  ["onsite", "On-site"],
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
];

const LEVEL: Array<[string, string]> = [
  ["", "—"],
  ["entry", "Entry"],
  ["mid", "Mid"],
  ["senior", "Senior"],
  ["lead", "Lead"],
  ["executive", "Executive"],
];

const PERIOD: Array<[string, string]> = [
  ["", "—"],
  ["hour", "per hour"],
  ["month", "per month"],
  ["year", "per year"],
];

export function JobsForm() {
  return (
    <>
      <CommonFields priceLabel="Featured pay (optional)" />
      <FormSection title="Role" cols={2}>
        <Field label="Company name" required>
          <TextInput name="companyName" required />
        </Field>
        <Field label="Function / Department">
          <TextInput name="function" placeholder="e.g. Engineering" />
        </Field>
        <Field label="Industry">
          <TextInput name="industry" />
        </Field>
        <Field label="Experience level">
          <Select name="experienceLevel" defaultValue="" options={LEVEL} />
        </Field>
        <Field label="Employment type" required>
          <Select name="employmentType" required defaultValue="full_time" options={EMPLOYMENT} />
        </Field>
        <Field label="Work arrangement" required>
          <Select name="workArrangement" required defaultValue="onsite" options={ARRANGEMENT} />
        </Field>
      </FormSection>

      <FormSection title="Salary range" cols={2}>
        <Field label="Salary min">
          <NumberInput name="salaryMin" min={0} step={1} />
        </Field>
        <Field label="Salary max">
          <NumberInput name="salaryMax" min={0} step={1} />
        </Field>
        <Field label="Salary period">
          <Select name="salaryPeriod" defaultValue="" options={PERIOD} />
        </Field>
        <Field label="Application deadline" hint="YYYY-MM-DD">
          <TextInput name="applicationDeadline" type="date" />
        </Field>
        <Field label="External application URL">
          <TextInput name="applicationUrl" type="url" placeholder="https://..." />
        </Field>
      </FormSection>

      <FormSection title="Details">
        <Field label="Requirements" hint="One per line.">
          <TextArea name="requirements" rows={4} />
        </Field>
        <Field label="Benefits" hint="One per line.">
          <TextArea name="benefits" rows={4} />
        </Field>
      </FormSection>
    </>
  );
}
