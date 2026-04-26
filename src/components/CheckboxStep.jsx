import cbStyles from './CheckboxStep.module.css';

/**
 * CheckboxStep — accessible multi-select checkbox group.
 *
 * Props:
 *   name      {string}   — input name prefix
 *   options   {Array}    — [{ value, label, description? }]
 *   values    {string[]} — currently checked values (empty array = none)
 *   onChange  {function} — called with the updated values array
 */
export default function CheckboxStep({ name, options, values = [], onChange }) {
  function toggle(optValue) {
    const next = values.includes(optValue)
      ? values.filter(v => v !== optValue)
      : [...values, optValue];
    onChange(next);
  }

  return (
    <div className={cbStyles.group} role="group">
      <p className={cbStyles.hint}>Select all that apply</p>
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        const checked = values.includes(opt.value);
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={`${cbStyles.option} ${checked ? cbStyles.selected : ''}`}
          >
            <input
              type="checkbox"
              id={id}
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => toggle(opt.value)}
              className={cbStyles.input}
            />
            <span className={cbStyles.check} aria-hidden="true">
              {checked ? '✓' : ''}
            </span>
            <span className={cbStyles.labelText}>
              {opt.label}
              {opt.description && (
                <span className={cbStyles.optDescription}>{opt.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
