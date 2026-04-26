import radioStyles from './RadioStep.module.css';

/**
 * RadioStep — accessible radio button group.
 *
 * Props:
 *   name      {string}   — input name attribute (unique per step)
 *   options   {Array}    — [{ value, label, description? }]
 *   value     {*}        — currently selected value (or null)
 *   onChange  {function} — called with the new value when selection changes
 */
export default function RadioStep({ name, options, value, onChange }) {
  return (
    <div className={radioStyles.group} role="group">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={`${radioStyles.option} ${checked ? radioStyles.selected : ''}`}
          >
            <input
              type="radio"
              id={id}
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className={radioStyles.input}
            />
            <span className={radioStyles.labelText}>
              {opt.label}
              {opt.description && (
                <span className={radioStyles.optDescription}>{opt.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
