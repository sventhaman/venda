import {
  CommonFields,
  Field,
  FormSection,
  NumberInput,
  Select,
  TextInput,
  type ListingFormDefaults,
} from "./shared";

const FUEL: Array<[string, string]> = [
  ["petrol", "Petrol"],
  ["diesel", "Diesel"],
  ["hybrid", "Hybrid"],
  ["phev", "Plug-in hybrid"],
  ["electric", "Electric"],
  ["lpg", "LPG"],
  ["other", "Other"],
];

const TRANSMISSION: Array<[string, string]> = [
  ["manual", "Manual"],
  ["automatic", "Automatic"],
  ["semi_auto", "Semi-auto"],
];

const BODY: Array<[string, string]> = [
  ["sedan", "Sedan"],
  ["hatchback", "Hatchback"],
  ["wagon", "Wagon"],
  ["suv", "SUV"],
  ["coupe", "Coupe"],
  ["convertible", "Convertible"],
  ["pickup", "Pickup"],
  ["van", "Van"],
  ["minivan", "Minivan"],
  ["other", "Other"],
];

const DRIVE: Array<[string, string]> = [
  ["", "—"],
  ["fwd", "Front-wheel drive"],
  ["rwd", "Rear-wheel drive"],
  ["awd", "All-wheel drive"],
  ["4wd", "Four-wheel drive"],
];

export function CarsForm({ defaults }: { defaults?: ListingFormDefaults }) {
  const d = (defaults?.details ?? {}) as Record<string, any>;
  return (
    <>
      <CommonFields priceLabel="Asking price" defaults={defaults} />
      <FormSection title="Vehicle" cols={2}>
        <Field label="Make" required>
          <TextInput name="make" required defaultValue={d.make} />
        </Field>
        <Field label="Model" required>
          <TextInput name="model" required defaultValue={d.model} />
        </Field>
        <Field label="Year" required>
          <NumberInput name="year" required min={1900} max={2100} defaultValue={d.year} />
        </Field>
        <Field label="Mileage (km)">
          <NumberInput name="mileageKm" min={0} step={1} defaultValue={d.mileageKm} />
        </Field>
        <Field label="Fuel type" required>
          <Select name="fuelType" required defaultValue={d.fuelType ?? "petrol"} options={FUEL} />
        </Field>
        <Field label="Transmission" required>
          <Select name="transmission" required defaultValue={d.transmission ?? "manual"} options={TRANSMISSION} />
        </Field>
        <Field label="Body type" required>
          <Select name="bodyType" required defaultValue={d.bodyType ?? "sedan"} options={BODY} />
        </Field>
        <Field label="Drivetrain">
          <Select name="drivetrain" defaultValue={d.drivetrain ?? ""} options={DRIVE} />
        </Field>
        <Field label="Engine power (HP)">
          <NumberInput name="enginePowerHp" min={0} step={1} defaultValue={d.enginePowerHp} />
        </Field>
        <Field label="Exterior color">
          <TextInput name="exteriorColor" defaultValue={d.exteriorColor} />
        </Field>
      </FormSection>
    </>
  );
}
