import {
  Checkbox,
  CommonFields,
  Field,
  FormSection,
  Select,
  TextInput,
  type ListingFormDefaults,
} from "./shared";

const CATEGORIES: Array<[string, string]> = [
  ["clothing", "Clothing"],
  ["furniture", "Furniture"],
  ["electronics", "Electronics"],
  ["appliances", "Appliances"],
  ["sports_outdoors", "Sports & outdoors"],
  ["toys_games", "Toys & games"],
  ["books_media", "Books & media"],
  ["home_garden", "Home & garden"],
  ["tools", "Tools"],
  ["kids_baby", "Kids & baby"],
  ["art_collectibles", "Art & collectibles"],
  ["other", "Other"],
];

const CONDITIONS: Array<[string, string]> = [
  ["new", "New"],
  ["like_new", "Like new"],
  ["good", "Good"],
  ["fair", "Fair"],
  ["for_parts", "For parts"],
];

export function GoodsForm({ defaults }: { defaults?: ListingFormDefaults }) {
  const d = (defaults?.details ?? {}) as Record<string, any>;
  return (
    <>
      <CommonFields defaults={defaults} />
      <FormSection title="Item details" cols={2}>
        <Field label="Category" required>
          <Select
            name="category"
            required
            defaultValue={d.category ?? "other"}
            options={CATEGORIES}
          />
        </Field>
        <Field label="Condition" required>
          <Select
            name="condition"
            required
            defaultValue={d.condition ?? "good"}
            options={CONDITIONS}
          />
        </Field>
        <Field label="Brand">
          <TextInput name="brand" defaultValue={d.brand} />
        </Field>
        <Field label="Size">
          <TextInput name="size" defaultValue={d.size} />
        </Field>
        <Field label="Color">
          <TextInput name="color" defaultValue={d.color} />
        </Field>
      </FormSection>
      <FormSection title="Delivery">
        <Checkbox name="shippingAvailable" label="I can ship this item" defaultChecked={!!d.shippingAvailable} />
        <Checkbox name="pickupOnly" label="Pickup only" defaultChecked={!!d.pickupOnly} />
      </FormSection>
    </>
  );
}
