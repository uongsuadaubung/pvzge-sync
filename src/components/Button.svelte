<script lang="ts">
  interface Props {
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "danger" | "outline" | "link" | "back" | "settings";
    fullWidth?: boolean;
    disabled?: boolean;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    title?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let { 
    type = "button", 
    variant = "primary", 
    fullWidth = false, 
    disabled = false, 
    class: className = "",
    onclick,
    title,
    children,
    ...rest
  }: Props = $props();
</script>

<button
  {type}
  class="btn {variant} {fullWidth ? 'full-width' : ''} {className}"
  {disabled}
  {onclick}
  {title}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</button>

<style lang="scss">
  .btn {
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-size: 0.88rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.18s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    letter-spacing: 0.3px;
    position: relative;
    text-decoration: none;

    &.full-width { width: 100%; }

    &.primary {
      background: linear-gradient(160deg, var(--primary), var(--primary-dark));
      color: var(--bg);
      font-weight: 700;
      box-shadow: 0 3px 10px var(--glow-primary);

      &:hover:not(:disabled) {
        background: linear-gradient(160deg, var(--primary), var(--primary-light));
        box-shadow: 0 5px 16px rgba(var(--primary-rgb), 0.5);
        transform: translateY(-1px);
      }
      &:active:not(:disabled) { transform: translateY(0); }
    }

    &.secondary {
      background: linear-gradient(160deg, var(--secondary), var(--secondary-dark));
      color: var(--bg);
      font-weight: 700;
      box-shadow: 0 3px 10px rgba(var(--secondary-rgb), 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(160deg, var(--secondary-light), var(--secondary-dark));
        box-shadow: 0 5px 16px rgba(var(--secondary-rgb), 0.45);
        transform: translateY(-1px);
      }
    }

    &.danger {
      background: linear-gradient(160deg, var(--error), #d32f2f);
      color: white;
      font-weight: 700;
      box-shadow: 0 3px 10px var(--glow-error);

      &:hover:not(:disabled) {
        background: linear-gradient(160deg, #ff6b6b, #e53935);
        box-shadow: 0 5px 16px rgba(var(--error-rgb), 0.5);
        transform: translateY(-1px);
      }
    }

    &.outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-dim);

      &:hover:not(:disabled) {
        background: var(--surface-light);
        border-color: var(--primary-dark);
        color: var(--text);
      }
    }

    &.link {
      background: none;
      border: none;
      color: var(--secondary);
      padding: 0;
      font-size: 0.85rem;
      &:hover:not(:disabled) { text-decoration: underline; }
    }

    &.back {
      background: transparent;
      color: var(--text-dim);
      padding: 8px;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      &:hover:not(:disabled) {
        color: var(--primary);
        background: var(--surface-light);
        transform: translateX(-2px);
      }
    }

    &.settings {
      background: none;
      font-size: 1.2rem;
      padding: 0;
      color: var(--text-dim);
      &:hover:not(:disabled) {
        color: var(--primary);
        transform: rotate(30deg);
      }
    }

    &:disabled {
      background: var(--surface-light);
      color: var(--text-dim);
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
      opacity: 0.6;
    }
  }
</style>
