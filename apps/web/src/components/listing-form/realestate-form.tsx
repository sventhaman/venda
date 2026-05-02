import {
  Checkbox,
  CommonFields,
  Field,
  FormSection,
  NumberInput,
  Select,
  TextInput,
  type ListingFormDefaults,
} from "./shared";

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

export function RealEstateForm({ defaults }: { defaults?: ListingFormDefaults }) {
  const d = (defaults?.details ?? {}) as Record<string, any>;
  return (
    <>
      <CommonFields priceLabel="Price (or monthly rent)" defaults={defaults} />
      <FormSection title="Property" cols={2}>
        <Field label="Deal type" required>
          <Select name="dealType" required defaultValue={d.dealType ?? "sale"} options={DEAL} />
        </Field>
        <Field label="Property type" required>
          <Select name="propertyType" required defaultValue={d.propertyType ?? "apartment"} options={PROP} />
        </Field>
        <Field label="Living area (m²)">
          <NumberInput name="livingAreaSqm" step="0.01" min={0} defaultValue={d.livingAreaSqm} />
        </Field>
        <Field label="Year built">
          <NumberInput name="yearBuilt" min={1000} max={2100} defaultValue={d.yearBuilt} />
        </Field>
        <Field label="Bedrooms">
          <NumberInput name="bedrooms" min={0} step={1} defaultValue={d.bedrooms} />
        </Field>
        <Field label="Bathrooms">
          <NumberInput name="bathrooms" min={0} step={1} defaultValue={d.bathrooms} />
        </Field>
        <Field label="Energy rating" hint="A, B, C, …">
          <TextInput name="energyRating" maxLength={2} defaultValue={d.energyRating} />
        </Field>
        <Field label="Available from" hint="YYYY-MM-DD">
          <TextInput name="availableFrom" type="date" defaultValue={d.availableFrom} />
        </Field>
      </FormSection>
      <FormSection title="Features">
        <div className="grid gap-2 sm:grid-cols-2">
          <Checkbox name="hasElevator" label="Elevator" defaultChecked={!!d.hasElevator} />
          <Checkbox name="hasBalcony" label="Balcony" defaultChecked={!!d.hasBalcony} />
          <Checkbox name="hasGarden" label="Garden" defaultChecked={!!d.hasGarden} />
          <Checkbox name="hasParking" label="Parking" defaultChecked={!!d.hasParking} />
          <Checkbox name="furnished" label="Furnished" defaultChecked={!!d.furnished} />
        </div>
      </FormSection>
    </>
  );
}
