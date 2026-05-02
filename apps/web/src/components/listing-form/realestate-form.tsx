import { Checkbox, CommonFields, Field, FormSection, NumberInput, Select, TextInput } from "./shared";

const DEAL: Array<[string, string]> = [
  ["sale", "For sale"],
  ["rent_long", "Long-term rent"],
  ["rent_short", "Short-term rent"],
];

const PROP: Array<[string, string]> = [
  ["apartment", "Apartment"],
  ["house", "House"],
  ["townhouse", "Townhouse"],
  ["cabin", "Cabin"],
  ["plot", "Plot"],
  ["commercial", "Commercial"],
  ["room", "Room"],
  ["other", "Other"],
];

export function RealEstateForm() {
  return (
    <>
      <CommonFields priceLabel="Price (or monthly rent)" />
      <FormSection title="Property" cols={2}>
        <Field label="Deal type" required>
          <Select name="dealType" required defaultValue="sale" options={DEAL} />
        </Field>
        <Field label="Property type" required>
          <Select name="propertyType" required defaultValue="apartment" options={PROP} />
        </Field>
        <Field label="Living area (m²)">
          <NumberInput name="livingAreaSqm" step="0.01" min={0} />
        </Field>
        <Field label="Year built">
          <NumberInput name="yearBuilt" min={1000} max={2100} />
        </Field>
        <Field label="Bedrooms">
          <NumberInput name="bedrooms" min={0} step={1} />
        </Field>
        <Field label="Bathrooms">
          <NumberInput name="bathrooms" min={0} step={1} />
        </Field>
        <Field label="Energy rating" hint="A, B, C, …">
          <TextInput name="energyRating" maxLength={2} />
        </Field>
        <Field label="Available from" hint="YYYY-MM-DD">
          <TextInput name="availableFrom" type="date" />
        </Field>
      </FormSection>
      <FormSection title="Features">
        <div className="grid gap-2 sm:grid-cols-2">
          <Checkbox name="hasElevator" label="Elevator" />
          <Checkbox name="hasBalcony" label="Balcony" />
          <Checkbox name="hasGarden" label="Garden" />
          <Checkbox name="hasParking" label="Parking" />
          <Checkbox name="furnished" label="Furnished" />
        </div>
      </FormSection>
    </>
  );
}
