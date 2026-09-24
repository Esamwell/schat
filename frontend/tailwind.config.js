module.exports = {
  prefix: 'tw-',
  purge: {
    enabled: true,
    content: [
      './src/**/*.vue',
      './src/**/*.js',
      './index.html'
    ]
  },
  darkMode: 'class',
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--izing-border))',
        input: 'hsl(var(--izing-input))',
        ring: 'hsl(var(--izing-ring))',
        background: 'hsl(var(--izing-background))',
        foreground: 'hsl(var(--izing-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--izing-primary))',
          foreground: 'hsl(var(--izing-primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--izing-secondary))',
          foreground: 'hsl(var(--izing-secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--izing-destructive))',
          foreground: 'hsl(var(--izing-destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--izing-muted))',
          foreground: 'hsl(var(--izing-muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--izing-accent))',
          foreground: 'hsl(var(--izing-accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--izing-popover))',
          foreground: 'hsl(var(--izing-popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--izing-card))',
          foreground: 'hsl(var(--izing-card-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--izing-radius)',
        md: 'calc(var(--izing-radius) - 2px)',
        sm: 'calc(var(--izing-radius) - 4px)'
      },
      boxShadow: {
        card: '0 4px 6px -1px hsl(214 84% 27% / 0.1)',
        elegant: '0 10px 40px -10px hsl(214 84% 27% / 0.3)'
      }
    }
  },
  variants: {},
  plugins: []
}
