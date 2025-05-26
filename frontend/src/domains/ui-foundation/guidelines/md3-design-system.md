# Material Design 3 Design System Guidelines

## Quick Reference

### Color Roles
- **Primary**: Main brand color, key actions
- **Secondary**: Supporting color, less prominent actions
- **Tertiary**: Accent color, highlights and contrast
- **Error/Warning/Success**: Semantic feedback colors
- **Surface**: Background containers and cards
- **Outline**: Borders and dividers

### Typography Scale
- **Display**: Large, short text (57/45/36px)
- **Headline**: High-emphasis text (32/28/24px)
- **Title**: Medium-emphasis text (22/16/14px)
- **Body**: Default text (16/14px)
- **Label**: UI elements (14/12/11px)

### Spacing System
- **Base unit**: 4dp (4px)
- **Common values**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64px

---

## Material Design 3 Color System

### Color Roles and Usage

Material Design 3 uses semantic color roles rather than literal color names:

```typescript
// ✅ CORRECT: Use semantic color roles
<Button color="primary">Primary Action</Button>
<Button color="secondary">Secondary Action</Button>
<Alert severity="error">Error message</Alert>

// ❌ INCORRECT: Don't use literal colors
<Button sx={{ backgroundColor: '#1976d2' }}>Button</Button>
```

### Dynamic Color Implementation

```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // or 'dark'
    primary: {
      main: '#6750A4',
      light: '#7F67BE',
      dark: '#553C9A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#625B71',
      light: '#7A7289',
      dark: '#4A4458',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#7D5260',
      light: '#986B79',
      dark: '#633B48',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#BA1A1A',
      light: '#DE3730',
      dark: '#93000A',
      contrastText: '#FFFFFF',
    },
    surface: {
      main: '#FEF7FF',
      variant: '#E7E0EC',
    },
    outline: {
      main: '#79747E',
      variant: '#CAC4D0',
    },
  },
});
```

### Surface Color Hierarchy

```typescript
// Surface elevation using Material Design 3 tokens
const surfaceColors = {
  surface: '#FEF7FF',      // Level 0 - Base surface
  surfaceVariant: '#E7E0EC', // Variant surface
  surfaceContainer: '#F3EDF7', // Level 1 container
  surfaceContainerHigh: '#ECE6F0', // Level 2 container
  surfaceContainerHighest: '#E6E0E9', // Level 3 container
};

// Usage in components
<Card sx={{ backgroundColor: 'surface.main' }}>
  <CardContent sx={{ backgroundColor: 'surface.container' }}>
    Content
  </CardContent>
</Card>
```

---

## Typography System

### Material Design 3 Type Scale

```typescript
const theme = createTheme({
  typography: {
    // Display - Large, short, important text
    displayLarge: {
      fontSize: '57px',
      lineHeight: '64px',
      fontWeight: 400,
      letterSpacing: '-0.25px',
    },
    displayMedium: {
      fontSize: '45px',
      lineHeight: '52px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
    displaySmall: {
      fontSize: '36px',
      lineHeight: '44px',
      fontWeight: 400,
      letterSpacing: '0px',
    },

    // Headline - High-emphasis text
    headlineLarge: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
    headlineMedium: {
      fontSize: '28px',
      lineHeight: '36px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
    headlineSmall: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 400,
      letterSpacing: '0px',
    },

    // Title - Medium-emphasis text
    titleLarge: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: 400,
      letterSpacing: '0px',
    },
    titleMedium: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 500,
      letterSpacing: '0.15px',
    },
    titleSmall: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },

    // Body - Default text
    bodyLarge: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
      letterSpacing: '0.5px',
    },
    bodyMedium: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0.25px',
    },
    bodySmall: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      letterSpacing: '0.4px',
    },

    // Label - UI elements
    labelLarge: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.1px',
    },
    labelMedium: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
    labelSmall: {
      fontSize: '11px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
  },
});
```

### Typography Usage Examples

```typescript
// ✅ CORRECT: Use semantic typography variants
<Typography variant="displayLarge">Hero Title</Typography>
<Typography variant="headlineMedium">Section Header</Typography>
<Typography variant="bodyLarge">Main content text</Typography>
<Typography variant="labelMedium">Button text</Typography>

// ❌ INCORRECT: Don't use arbitrary font sizes
<Typography sx={{ fontSize: '24px' }}>Header</Typography>
```

---

## Spacing System

### 4dp Base Unit System

Material Design 3 uses a 4dp base unit for consistent spacing:

```typescript
const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  xxl: 24,  // 24px
  xxxl: 32, // 32px
  xxxxl: 40, // 40px
};

// Usage with Material-UI spacing function
<Box sx={{
  padding: 2,      // 16px (2 * 8px)
  margin: 3,       // 24px (3 * 8px)
  gap: 1,          // 8px (1 * 8px)
}} />

// Custom spacing values
<Box sx={{
  padding: '16px',  // Use 4dp multiples
  margin: '24px',   // Use 4dp multiples
}} />
```

### Component Spacing Patterns

```typescript
// Card spacing
<Card sx={{ padding: 3 }}> {/* 24px */}
  <CardContent sx={{ padding: 2 }}> {/* 16px */}
    <Stack spacing={2}> {/* 16px between items */}
      <Typography variant="titleLarge">Title</Typography>
      <Typography variant="bodyMedium">Content</Typography>
    </Stack>
  </CardContent>
</Card>

// Form spacing
<Stack spacing={3}> {/* 24px between form fields */}
  <TextField label="Field 1" />
  <TextField label="Field 2" />
  <Button>Submit</Button>
</Stack>
```

---

## Elevation and Shadows

### Material Design 3 Elevation Tokens

```typescript
const elevation = {
  level0: 'none',
  level1: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
  level4: '0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
  level5: '0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
};

// Usage in theme
const theme = createTheme({
  shadows: [
    'none',
    elevation.level1,
    elevation.level2,
    elevation.level3,
    elevation.level4,
    elevation.level5,
    // ... continue for all 25 elevation levels
  ],
});
```

### Elevation Usage Guidelines

```typescript
// ✅ CORRECT: Use appropriate elevation levels
<Card elevation={1}>Basic card</Card>
<Dialog elevation={3}>Modal dialog</Dialog>
<AppBar elevation={0}>Top app bar</AppBar>
<Fab elevation={2}>Floating action button</Fab>

// Component-specific elevation
<Paper
  elevation={2}
  sx={{
    padding: 2,
    borderRadius: 2, // 16px radius
  }}
>
  Content
</Paper>
```

---

## Shape System

### Corner Radius Tokens

```typescript
const shape = {
  none: 0,
  extraSmall: 4,   // 4px
  small: 8,        // 8px
  medium: 12,      // 12px
  large: 16,       // 16px
  extraLarge: 28,  // 28px
  full: 9999,      // Fully rounded
};

// Theme configuration
const theme = createTheme({
  shape: {
    borderRadius: 12, // Default medium radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // Large radius for buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Medium radius for cards
        },
      },
    },
  },
});
```

---

## Responsive Layout System

### Material Design 3 Breakpoints

```typescript
const breakpoints = {
  compact: 0,      // 0-599px (mobile)
  medium: 600,     // 600-839px (tablet)
  expanded: 840,   // 840px+ (desktop)
};

// Usage in components
<Grid container spacing={2}>
  <Grid item xs={12} md={6} lg={4}>
    <Card>Content</Card>
  </Grid>
</Grid>

// Responsive styling
<Box sx={{
  padding: { xs: 2, md: 3, lg: 4 },
  fontSize: { xs: '14px', md: '16px', lg: '18px' },
}}>
  Responsive content
</Box>
```

### Container Patterns

```typescript
// ✅ CORRECT: Use proper container patterns
<Container maxWidth="lg" sx={{ padding: { xs: 2, md: 3 } }}>
  <Grid container spacing={{ xs: 2, md: 3 }}>
    <Grid item xs={12} md={8}>
      <Paper elevation={1} sx={{ padding: 3 }}>
        Main content
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper elevation={1} sx={{ padding: 3 }}>
        Sidebar
      </Paper>
    </Grid>
  </Grid>
</Container>
```

---

## Motion Principles

### Easing and Duration

```typescript
const motion = {
  // Easing curves
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0, 1.0)',
    accelerate: 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
  },

  // Duration tokens
  duration: {
    short1: 50,   // 50ms
    short2: 100,  // 100ms
    short3: 150,  // 150ms
    short4: 200,  // 200ms
    medium1: 250, // 250ms
    medium2: 300, // 300ms
    medium3: 350, // 350ms
    medium4: 400, // 400ms
    long1: 450,   // 450ms
    long2: 500,   // 500ms
    long3: 550,   // 550ms
    long4: 600,   // 600ms
  },
};

// Usage in transitions
<Fade
  in={open}
  timeout={motion.duration.medium2}
  easing={motion.easing.standard}
>
  <Paper>Content</Paper>
</Fade>
```

---

## Implementation Checklist

### Theme Setup
- [ ] Configure Material Design 3 color roles
- [ ] Implement complete typography scale
- [ ] Set up proper spacing system
- [ ] Configure elevation tokens
- [ ] Define shape/border radius tokens

### Component Styling
- [ ] Use semantic color roles (primary, secondary, etc.)
- [ ] Apply correct typography variants
- [ ] Use 4dp spacing multiples
- [ ] Apply appropriate elevation levels
- [ ] Use consistent border radius values

### Responsive Design
- [ ] Implement Material Design 3 breakpoints
- [ ] Use responsive spacing and typography
- [ ] Test on compact, medium, and expanded layouts
- [ ] Ensure proper touch targets (44px minimum)

### Motion and Transitions
- [ ] Use Material Design 3 easing curves
- [ ] Apply appropriate duration tokens
- [ ] Implement consistent transition patterns
- [ ] Test motion on different devices

---

## Common Pitfalls

### ❌ Don't Do
- Use arbitrary color values instead of theme tokens
- Mix different typography scales or spacing systems
- Apply custom shadows instead of elevation tokens
- Use inconsistent border radius values
- Ignore responsive design principles

### ✅ Do
- Always use theme tokens and semantic color roles
- Follow the complete Material Design 3 type scale
- Use 4dp spacing multiples consistently
- Apply appropriate elevation for component hierarchy
- Design mobile-first with responsive breakpoints

---

## Official Resources

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Material-UI v5+ Documentation](https://mui.com/material-ui/)
- [Material Design 3 Color System](https://m3.material.io/styles/color/overview)
- [Material Design 3 Typography](https://m3.material.io/styles/typography/overview)
- [Material Design 3 Motion](https://m3.material.io/styles/motion/overview)
