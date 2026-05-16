<script lang="ts">
  interface Props {
    checked: boolean;
    label?: string;
    id?: string;
    onchange?: (val: boolean) => void;
  }

  let { checked = $bindable(), label = "", id = "", onchange }: Props = $props();

  function toggle() {
    checked = !checked;
    onchange?.(checked);
  }
</script>

<button
  type="button"
  class="custom-checkbox-container {checked ? 'checked' : ''}"
  {id}
  onclick={toggle}
  role="checkbox"
  aria-checked={checked}
>
  <div class="box">
    {#if checked}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    {/if}
  </div>
  {#if label}
    <span class="label-text">{label}</span>
  {/if}
</button>

<style lang="scss">
  .custom-checkbox-container {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    outline: none;
    text-align: left;

    .box {
      width: 22px;
      height: 22px;
      background: var(--bg);
      border: 2px solid var(--border);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      color: transparent;
      flex-shrink: 0;

      svg {
        width: 16px;
        height: 16px;
        transform: scale(0.5);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    }

    .label-text {
      color: var(--text-dim);
      font-size: 0.88rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    &:hover {
      .box { border-color: var(--primary-dark); }
      .label-text { color: var(--text); }
    }

    &:focus .box {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
    }

    &.checked {
      .box {
        background: var(--primary);
        border-color: var(--primary);
        color: var(--bg);
        box-shadow: 0 2px 8px var(--glow-primary);

        svg {
          transform: scale(1);
        }
      }
      .label-text { color: var(--text); }
    }

    &:active .box {
      transform: scale(0.92);
    }
  }
</style>
