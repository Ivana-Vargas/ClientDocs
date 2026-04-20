# design standards

Use only semantic tokens from `design-tokens.css`.

## color usage

- page background: `--color-bg-app`
- card surface: `--color-bg-surface`
- primary text: `--color-text-primary`
- secondary text: `--color-text-muted`
- primary actions: `--color-primary`
- primary actions hover: `--color-primary-hover`
- borders: `--color-border-soft`

## spacing and radius

- small radius: `--radius-sm`
- medium radius: `--radius-md`
- large radius: `--radius-lg`

## elevation

- use `--shadow-soft` for cards and floating panels

## rules

- do not hardcode random hex values in feature components
- define new tokens in `design-tokens.css` first, then use them
- keep blue + neutral palette style (no bright cyan or saturated colors)
