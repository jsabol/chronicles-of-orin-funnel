import { useEffect, useId, useRef } from "react";
import Choices from "choices.js";
import { TRINKETS } from "../data";
import styles from "./FormFields.module.scss";

type Option = {
  id: string | number;
  name?: string;
  text?: string;
  points?: number;
};
const labelOf = (item: string | Option) =>
  typeof item === "string"
    ? item.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : (item.name ?? item.text ?? String(item.id));
export function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value?: string | number;
  options: readonly (string | Option)[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const fieldId = useId();
  const select = useRef<HTMLSelectElement>(null);
  const choices = useRef<Choices | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const element = select.current;
    if (!element) return;

    const instance = new Choices(element, {
      searchEnabled: false,
      shouldSort: false,
      itemSelectText: "",
      allowHTML: false,
    });
    choices.current = instance;
    const changed = () => onChangeRef.current(element.value);
    element.addEventListener("change", changed);

    return () => {
      element.removeEventListener("change", changed);
      instance.destroy();
      choices.current = null;
    };
  }, []);

  useEffect(() => {
    choices.current?.setChoiceByValue(String(value ?? ""));
  }, [value]);

  useEffect(() => {
    if (disabled) choices.current?.disable();
    else choices.current?.enable();
  }, [disabled]);

  return (
    <div className={styles.field}>
      <label htmlFor={fieldId}>{label}</label>
      <div>
        <select
          id={fieldId}
          ref={select}
          autoComplete="off"
          defaultValue={value ?? ""}
          disabled={disabled}
        >
          {options.map((item) => {
            const id = typeof item === "string" ? item : item.id;
            return (
              <option key={String(id)} value={id}>
                {labelOf(item)}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
export function TextField({
  label,
  value,
  type = "text",
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div>
        <input
          type={type}
          autoComplete="off"
          value={value}
          readOnly={readOnly}
          min={type === "number" ? 1 : undefined}
          max={type === "number" ? 18 : undefined}
          maxLength={type === "text" ? 180 : undefined}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    </label>
  );
}
export function TrinketField({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: string) => void;
}) {
  const select = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const element = select.current;
    if (!element) return;
    const choices = new Choices(element, {
      searchEnabled: true,
      shouldSort: false,
      itemSelectText: "",
      searchPlaceholderValue: "Search trinkets",
      allowHTML: false,
    });
    const changed = () => onChange(element.value);
    element.addEventListener("change", changed);
    return () => {
      element.removeEventListener("change", changed);
      choices.destroy();
    };
  }, [value, onChange]);
  return (
    <div className={styles.field}>
      <label htmlFor="field-trinket">Trinket</label>
      <div>
        <select
          id="field-trinket"
          ref={select}
          autoComplete="off"
          defaultValue={String(value)}
        >
          {TRINKETS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.text}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
