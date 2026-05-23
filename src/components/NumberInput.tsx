interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  onchange?: (val: number) => void;
  fullWidth?: boolean;
}

export default function NumberInput(props: Props) {
  const minVal = () => props.min !== undefined ? props.min : 0;
  const maxVal = () => props.max !== undefined ? props.max : Infinity;
  const stepVal = () => props.step !== undefined ? props.step : 1;

  function decrease() {
    const newVal = Math.max(minVal(), props.value - stepVal());
    props.onchange?.(newVal);
  }

  function increase() {
    const newVal = Math.min(maxVal(), props.value + stepVal());
    props.onchange?.(newVal);
  }

  function handleInput(e: Event) {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const val = parseInt(target.value);
      if (!isNaN(val)) {
        const newVal = Math.max(minVal(), Math.min(maxVal(), val));
        props.onchange?.(newVal);
      }
    }
  }

  return (
    <div class={`number-stepper ${props.fullWidth ? "full-width" : ""}`}>
      <button
        type="button"
        class="stepper-btn"
        onClick={decrease}
        disabled={props.value <= minVal()}
        aria-label="Decrease"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <input
        type="number"
        id={props.id || ""}
        value={props.value}
        min={minVal()}
        max={maxVal()}
        onInput={handleInput}
      />
      <button
        type="button"
        class="stepper-btn"
        onClick={increase}
        disabled={props.value >= maxVal()}
        aria-label="Increase"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
