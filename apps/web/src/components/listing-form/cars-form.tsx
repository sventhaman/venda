import { CommonFields, Field, FormSection, NumberInput, Select, TextInput } from "./shared";

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

export function CarsForm() {
  return (
    <>
      <CommonFields priceLabel="Asking price" />
      <FormSection title="Vehicle" cols={2}>
        <Field label="Make" required>
          <TextInput name="make" required />
        </Field>
        <Field label="Model" required>
          <TextInput name="model" required />
        </Field>
        <Field label="Year" required>
          <NumberInput name="year" required min={1900} max={2100} />
        </Field>
        <Field label="Mileage (km)">
          <NumberInput name="mileageKm" min={0} step={1} />
        </Field>
        <Field label="Fuel type" required>
          <Select name="fuelType" required defaultValue="petrol" options={FUEL} />
        </Field>
        <Field label="Transmission" required>
          <Select name="transmission" required defaultValue="manual" options={TRANSMISSION} />
        </Field>
        <Field label="Body type" required>
          <Select name="bodyType" required defaultValue="sedan" options={BODY} />
        </Field>
        <Field label="Drivetrain">
          <Select name="drivetrain" defaultValue="" options={DRIVE} />
        </Field>
        <Field label="Engine power (HP)">
          <NumberInput name="enginePowerHp" min={0} step={1} />
        </Field>
        <Field label="Exterior color">
          <TextInput name="exteriorColor" />
        </Field>
      </FormSection>
    </>
  );
}
