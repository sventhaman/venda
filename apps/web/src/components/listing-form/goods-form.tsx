import { CommonFields, Field, FormSection, Select, TextInput, Checkbox } from "./shared";

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

export function GoodsForm() {
  return (
    <>
      <CommonFields />
      <FormSection title="Item details" cols={2}>
        <Field label="Category" required>
          <Select name="category" required defaultValue="other" options={CATEGORIES} />
        </Field>
        <Field label="Condition" required>
          <Select name="condition" required defaultValue="good" options={CONDITIONS} />
        </Field>
        <Field label="Brand">
          <TextInput name="brand" />
        </Field>
        <Field label="Size">
          <TextInput name="size" />
        </Field>
        <Field label="Color">
          <TextInput name="color" />
        </Field>
      </FormSection>
      <FormSection title="Delivery">
        <Checkbox name="shippingAvailable" label="I can ship this item" />
        <Checkbox name="pickupOnly" label="Pickup only" />
      </FormSection>
    </>
  );
}
