// Tiny presentational primitives so the per-vertical form files stay readable.

export function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-mute">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-lg border border-ink-line bg-white px-3 py-2 text-base focus:border-ink focus:outline-none disabled:opacity-50"
    />
  );
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput {...props} type="number" inputMode="numeric" />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="rounded-lg border border-ink-line bg-white px-3 py-2 text-base focus:border-ink focus:outline-none"
    />
  );
}

export function Select({
  options,
  ...rest
}: {
  options: Array<[value: string, label: string]>;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className="rounded-lg border border-ink-line bg-white px-3 py-2 text-base focus:border-ink focus:outline-none"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        name={name}
        className="h-4 w-4 rounded border-ink-line"
      />
      {label}
    </label>
  );
}

export function FormSection({
  title,
  children,
  cols = 1,
}: {
  title: string;
  children: React.ReactNode;
  cols?: 1 | 2;
}) {
  return (
    <section className="border-t border-ink-line pt-8 first:border-none first:pt-0">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className={cols === 2 ? "grid gap-4 sm:grid-cols-2" : "flex flex-col gap-4"}>
        {children}
      </div>
    </section>
  );
}
