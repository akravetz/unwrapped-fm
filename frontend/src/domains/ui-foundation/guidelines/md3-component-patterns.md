# Material Design 3 Component Patterns

## Quick Reference

### Navigation Components
- **App Bar**: Top navigation, 64px height, elevation 0-4
- **Navigation Drawer**: Side navigation, 360px width
- **Bottom Navigation**: 3-5 destinations, 80px height
- **Tabs**: Horizontal navigation, 48px height

### Action Components
- **Filled Button**: High emphasis, primary actions
- **Outlined Button**: Medium emphasis, secondary actions
- **Text Button**: Low emphasis, tertiary actions
- **FAB**: Primary action, 56px standard, 40px small

### Input Components
- **Text Field**: Single line input, 56px height
- **Select**: Dropdown selection, 56px height
- **Checkbox**: Binary selection, 40x40px touch target
- **Switch**: On/off toggle, 52x32px

---

## Navigation Components

### App Bar (Top Navigation)

```typescript
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu, Search, MoreVert } from '@mui/icons-material';

// ✅ CORRECT: Standard app bar implementation
<AppBar
  position="fixed"
  elevation={0}  // Material Design 3 uses minimal elevation
  sx={{
    backgroundColor: 'surface.main',
    color: 'onSurface.main',
  }}
>
  <Toolbar sx={{ height: 64 }}> {/* Standard 64px height */}
    <IconButton
      edge="start"
      color="inherit"
      aria-label="menu"
      sx={{ mr: 2 }}
    >
      <Menu />
    </IconButton>

    <Typography
      variant="titleLarge"
      component="h1"
      sx={{ flexGrow: 1 }}
    >
      App Title
    </Typography>

    <IconButton color="inherit" aria-label="search">
      <Search />
    </IconButton>
    <IconButton color="inherit" aria-label="more options">
      <MoreVert />
    </IconButton>
  </Toolbar>
</AppBar>
```

### Navigation Drawer

```typescript
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Settings, Help } from '@mui/icons-material';

// ✅ CORRECT: Navigation drawer with proper Material Design 3 styling
<Drawer
  variant="permanent"
  sx={{
    width: 360, // Standard drawer width
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 360,
      boxSizing: 'border-box',
      backgroundColor: 'surface.main',
      borderRight: '1px solid',
      borderColor: 'outline.variant',
    },
  }}
>
  <List sx={{ padding: 1 }}>
    {[
      { text: 'Home', icon: <Home />, selected: true },
      { text: 'Settings', icon: <Settings />, selected: false },
      { text: 'Help', icon: <Help />, selected: false },
    ].map((item) => (
      <ListItem key={item.text} disablePadding>
        <ListItemButton
          selected={item.selected}
          sx={{
            borderRadius: 3, // 24px radius for list items
            margin: '4px 8px',
            '&.Mui-selected': {
              backgroundColor: 'secondaryContainer.main',
              color: 'onSecondaryContainer.main',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{ variant: 'labelLarge' }}
          />
        </ListItemButton>
      </ListItem>
    ))}
  </List>
</Drawer>
```

### Bottom Navigation

```typescript
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, Search, Favorite, Person } from '@mui/icons-material';

// ✅ CORRECT: Bottom navigation with Material Design 3 specifications
<BottomNavigation
  value={value}
  onChange={(event, newValue) => setValue(newValue)}
  sx={{
    height: 80, // Standard height
    backgroundColor: 'surface.main',
    borderTop: '1px solid',
    borderColor: 'outline.variant',
  }}
>
  <BottomNavigationAction
    label="Home"
    value="home"
    icon={<Home />}
    sx={{
      '&.Mui-selected': {
        color: 'primary.main',
      },
    }}
  />
  <BottomNavigationAction
    label="Search"
    value="search"
    icon={<Search />}
  />
  <BottomNavigationAction
    label="Favorites"
    value="favorites"
    icon={<Favorite />}
  />
  <BottomNavigationAction
    label="Profile"
    value="profile"
    icon={<Person />}
  />
</BottomNavigation>
```

### Tabs

```typescript
import { Tabs, Tab, Box } from '@mui/material';

// ✅ CORRECT: Tabs with Material Design 3 styling
<Box sx={{ borderBottom: 1, borderColor: 'outline.variant' }}>
  <Tabs
    value={value}
    onChange={handleChange}
    sx={{
      minHeight: 48, // Standard tab height
      '& .MuiTab-root': {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '14px',
        minHeight: 48,
        color: 'onSurface.main',
        '&.Mui-selected': {
          color: 'primary.main',
        },
      },
      '& .MuiTabs-indicator': {
        backgroundColor: 'primary.main',
        height: 3, // 3px indicator height
      },
    }}
  >
    <Tab label="Tab One" />
    <Tab label="Tab Two" />
    <Tab label="Tab Three" />
  </Tabs>
</Box>
```

---

## Action Components

### Buttons

```typescript
import { Button, Stack } from '@mui/material';
import { Add, Download } from '@mui/icons-material';

// ✅ CORRECT: Button hierarchy and usage
<Stack direction="row" spacing={2}>
  {/* Filled Button - High emphasis */}
  <Button
    variant="contained"
    color="primary"
    startIcon={<Add />}
    sx={{
      borderRadius: 5, // 20px radius
      height: 40,      // Standard button height
      paddingX: 3,     // 24px horizontal padding
      textTransform: 'none',
      fontWeight: 500,
    }}
  >
    Primary Action
  </Button>

  {/* Outlined Button - Medium emphasis */}
  <Button
    variant="outlined"
    color="primary"
    startIcon={<Download />}
    sx={{
      borderRadius: 5,
      height: 40,
      paddingX: 3,
      textTransform: 'none',
      fontWeight: 500,
      borderWidth: 1,
    }}
  >
    Secondary Action
  </Button>

  {/* Text Button - Low emphasis */}
  <Button
    variant="text"
    color="primary"
    sx={{
      borderRadius: 5,
      height: 40,
      paddingX: 3,
      textTransform: 'none',
      fontWeight: 500,
    }}
  >
    Tertiary Action
  </Button>
</Stack>
```

### Floating Action Button (FAB)

```typescript
import { Fab, SpeedDial, SpeedDialAction } from '@mui/material';
import { Add, Edit, Share, Print } from '@mui/icons-material';

// ✅ CORRECT: Standard FAB
<Fab
  color="primary"
  aria-label="add"
  sx={{
    position: 'fixed',
    bottom: 16,
    right: 16,
    width: 56,  // Standard FAB size
    height: 56,
  }}
>
  <Add />
</Fab>

// ✅ CORRECT: Small FAB
<Fab
  size="small"
  color="secondary"
  aria-label="edit"
  sx={{
    width: 40,  // Small FAB size
    height: 40,
  }}
>
  <Edit />
</Fab>

// ✅ CORRECT: Extended FAB
<Fab
  variant="extended"
  color="primary"
  sx={{
    position: 'fixed',
    bottom: 16,
    right: 16,
    borderRadius: 4, // 16px radius for extended FAB
  }}
>
  <Add sx={{ mr: 1 }} />
  Create New
</Fab>
```

### Icon Buttons

```typescript
import { IconButton, Tooltip } from '@mui/material';
import { Favorite, Share, MoreVert } from '@mui/icons-material';

// ✅ CORRECT: Icon buttons with proper touch targets
<Stack direction="row" spacing={1}>
  <Tooltip title="Add to favorites">
    <IconButton
      aria-label="add to favorites"
      sx={{
        width: 48,  // Minimum 48px touch target
        height: 48,
        color: 'onSurface.main',
        '&:hover': {
          backgroundColor: 'primary.main',
          color: 'onPrimary.main',
        },
      }}
    >
      <Favorite />
    </IconButton>
  </Tooltip>

  <Tooltip title="Share">
    <IconButton
      aria-label="share"
      sx={{ width: 48, height: 48 }}
    >
      <Share />
    </IconButton>
  </Tooltip>

  <Tooltip title="More options">
    <IconButton
      aria-label="more options"
      sx={{ width: 48, height: 48 }}
    >
      <MoreVert />
    </IconButton>
  </Tooltip>
</Stack>
```

---

## Input Components

### Text Fields

```typescript
import { TextField, Stack } from '@mui/material';

// ✅ CORRECT: Text field variations
<Stack spacing={3}>
  {/* Filled variant (default) */}
  <TextField
    label="Filled"
    variant="filled"
    fullWidth
    sx={{
      '& .MuiFilledInput-root': {
        borderRadius: 1, // 4px top radius
        backgroundColor: 'surfaceVariant.main',
        '&:hover': {
          backgroundColor: 'surfaceVariant.dark',
        },
        '&.Mui-focused': {
          backgroundColor: 'surfaceVariant.main',
        },
      },
    }}
  />

  {/* Outlined variant */}
  <TextField
    label="Outlined"
    variant="outlined"
    fullWidth
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 1, // 4px radius
        '& fieldset': {
          borderColor: 'outline.main',
        },
        '&:hover fieldset': {
          borderColor: 'onSurface.main',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'primary.main',
          borderWidth: 2,
        },
      },
    }}
  />

  {/* Standard variant */}
  <TextField
    label="Standard"
    variant="standard"
    fullWidth
    sx={{
      '& .MuiInput-underline': {
        '&:before': {
          borderBottomColor: 'outline.main',
        },
        '&:hover:before': {
          borderBottomColor: 'onSurface.main',
        },
        '&:after': {
          borderBottomColor: 'primary.main',
        },
      },
    }}
  />
</Stack>
```

### Select Components

```typescript
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// ✅ CORRECT: Select with proper Material Design 3 styling
<FormControl fullWidth>
  <InputLabel id="select-label">Choose Option</InputLabel>
  <Select
    labelId="select-label"
    value={value}
    label="Choose Option"
    onChange={handleChange}
    sx={{
      borderRadius: 1, // 4px radius
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'outline.main',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'onSurface.main',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main',
        borderWidth: 2,
      },
    }}
  >
    <MenuItem value="option1">Option 1</MenuItem>
    <MenuItem value="option2">Option 2</MenuItem>
    <MenuItem value="option3">Option 3</MenuItem>
  </Select>
</FormControl>
```

### Checkboxes and Radio Buttons

```typescript
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Radio,
  RadioGroup
} from '@mui/material';

// ✅ CORRECT: Checkboxes with proper touch targets
<FormGroup>
  <FormControlLabel
    control={
      <Checkbox
        sx={{
          width: 48,  // 48px touch target
          height: 48,
          color: 'onSurface.main',
          '&.Mui-checked': {
            color: 'primary.main',
          },
        }}
      />
    }
    label="Option 1"
    sx={{
      '& .MuiFormControlLabel-label': {
        fontSize: '16px',
        color: 'onSurface.main',
      },
    }}
  />
  <FormControlLabel
    control={<Checkbox sx={{ width: 48, height: 48 }} />}
    label="Option 2"
  />
</FormGroup>

// ✅ CORRECT: Radio buttons
<FormControl>
  <RadioGroup value={value} onChange={handleChange}>
    <FormControlLabel
      value="option1"
      control={
        <Radio
          sx={{
            width: 48,
            height: 48,
            color: 'onSurface.main',
            '&.Mui-checked': {
              color: 'primary.main',
            },
          }}
        />
      }
      label="Option 1"
    />
    <FormControlLabel
      value="option2"
      control={<Radio sx={{ width: 48, height: 48 }} />}
      label="Option 2"
    />
  </RadioGroup>
</FormControl>
```

### Switches

```typescript
import { Switch, FormControlLabel } from '@mui/material';

// ✅ CORRECT: Switch with Material Design 3 styling
<FormControlLabel
  control={
    <Switch
      checked={checked}
      onChange={handleChange}
      sx={{
        width: 52,   // Standard switch width
        height: 32,  // Standard switch height
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: 2,
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: 'onPrimary.main',
            '& + .MuiSwitch-track': {
              backgroundColor: 'primary.main',
              opacity: 1,
              border: 0,
            },
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 28,
          height: 28,
          backgroundColor: 'outline.main',
        },
        '& .MuiSwitch-track': {
          borderRadius: 16,
          backgroundColor: 'surfaceVariant.main',
          opacity: 1,
        },
      }}
    />
  }
  label="Enable notifications"
/>
```

---

## Feedback Components

### Dialogs

```typescript
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

// ✅ CORRECT: Dialog with Material Design 3 styling
<Dialog
  open={open}
  onClose={handleClose}
  maxWidth="sm"
  fullWidth
  sx={{
    '& .MuiDialog-paper': {
      borderRadius: 7, // 28px radius
      padding: 3,
      backgroundColor: 'surface.main',
    },
  }}
>
  <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
    <Typography variant="headlineSmall">
      Dialog Title
    </Typography>
  </DialogTitle>

  <DialogContent sx={{ padding: 0, marginBottom: 3 }}>
    <Typography variant="bodyMedium" color="onSurface.main">
      Dialog content goes here. This should be clear and concise,
      explaining the action or information to the user.
    </Typography>
  </DialogContent>

  <DialogActions sx={{ padding: 0, gap: 1 }}>
    <Button
      onClick={handleClose}
      variant="text"
      sx={{ borderRadius: 5 }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleConfirm}
      variant="contained"
      sx={{ borderRadius: 5 }}
    >
      Confirm
    </Button>
  </DialogActions>
</Dialog>
```

### Snackbars

```typescript
import { Snackbar, Alert, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

// ✅ CORRECT: Snackbar with Material Design 3 styling
<Snackbar
  open={open}
  autoHideDuration={6000}
  onClose={handleClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
>
  <Alert
    onClose={handleClose}
    severity="success"
    variant="filled"
    sx={{
      borderRadius: 1, // 4px radius
      '& .MuiAlert-icon': {
        fontSize: '20px',
      },
      '& .MuiAlert-message': {
        fontSize: '14px',
        fontWeight: 500,
      },
    }}
    action={
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <Close fontSize="small" />
      </IconButton>
    }
  >
    This is a success message!
  </Alert>
</Snackbar>
```

### Progress Indicators

```typescript
import {
  CircularProgress,
  LinearProgress,
  Box,
  Typography
} from '@mui/material';

// ✅ CORRECT: Circular progress
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <CircularProgress
    size={40}
    thickness={4}
    sx={{ color: 'primary.main' }}
  />
  <Typography variant="bodyMedium">Loading...</Typography>
</Box>

// ✅ CORRECT: Linear progress
<Box sx={{ width: '100%' }}>
  <LinearProgress
    variant="determinate"
    value={progress}
    sx={{
      height: 4, // 4px height
      borderRadius: 2,
      backgroundColor: 'surfaceVariant.main',
      '& .MuiLinearProgress-bar': {
        backgroundColor: 'primary.main',
        borderRadius: 2,
      },
    }}
  />
  <Typography
    variant="bodySmall"
    color="onSurface.main"
    sx={{ mt: 1 }}
  >
    {`${Math.round(progress)}% complete`}
  </Typography>
</Box>
```

---

## Data Display Components

### Cards

```typescript
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button
} from '@mui/material';

// ✅ CORRECT: Card with Material Design 3 styling
<Card
  elevation={1}
  sx={{
    maxWidth: 345,
    borderRadius: 3, // 12px radius
    backgroundColor: 'surface.main',
    border: '1px solid',
    borderColor: 'outline.variant',
    '&:hover': {
      backgroundColor: 'surfaceVariant.main',
      borderColor: 'outline.main',
    },
  }}
>
  <CardMedia
    component="img"
    height="140"
    image="/api/placeholder/345/140"
    alt="Card image"
    sx={{ borderRadius: '12px 12px 0 0' }}
  />

  <CardContent sx={{ padding: 2 }}>
    <Typography
      variant="titleMedium"
      component="h2"
      sx={{ marginBottom: 1 }}
    >
      Card Title
    </Typography>
    <Typography
      variant="bodyMedium"
      color="onSurface.variant"
    >
      Card description goes here. This should be concise and informative.
    </Typography>
  </CardContent>

  <CardActions sx={{ padding: 2, paddingTop: 0 }}>
    <Button
      size="small"
      variant="text"
      sx={{ borderRadius: 5 }}
    >
      Learn More
    </Button>
    <Button
      size="small"
      variant="contained"
      sx={{ borderRadius: 5 }}
    >
      Action
    </Button>
  </CardActions>
</Card>
```

### Lists

```typescript
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import { Person, Work, Email } from '@mui/icons-material';

// ✅ CORRECT: List with Material Design 3 styling
<List sx={{ width: '100%', backgroundColor: 'surface.main' }}>
  <ListItem disablePadding>
    <ListItemButton
      sx={{
        borderRadius: 2, // 8px radius
        margin: '4px 8px',
        '&:hover': {
          backgroundColor: 'surfaceVariant.main',
        },
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ backgroundColor: 'primary.main' }}>
          <Person />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary="John Doe"
        secondary="Software Engineer"
        primaryTypographyProps={{ variant: 'titleMedium' }}
        secondaryTypographyProps={{ variant: 'bodyMedium' }}
      />
    </ListItemButton>
  </ListItem>

  <Divider sx={{ marginX: 2 }} />

  <ListItem disablePadding>
    <ListItemButton sx={{ borderRadius: 2, margin: '4px 8px' }}>
      <ListItemIcon>
        <Work />
      </ListItemIcon>
      <ListItemText
        primary="Work"
        secondary="Company Name"
        primaryTypographyProps={{ variant: 'titleMedium' }}
        secondaryTypographyProps={{ variant: 'bodyMedium' }}
      />
    </ListItemButton>
  </ListItem>
</List>
```

### Chips

```typescript
import { Chip, Stack } from '@mui/material';
import { Face, Done } from '@mui/icons-material';

// ✅ CORRECT: Chip variations
<Stack direction="row" spacing={1} flexWrap="wrap">
  {/* Filled chip */}
  <Chip
    label="Filled"
    sx={{
      backgroundColor: 'secondaryContainer.main',
      color: 'onSecondaryContainer.main',
      borderRadius: 2, // 8px radius
      height: 32,
      '& .MuiChip-label': {
        fontSize: '14px',
        fontWeight: 500,
        paddingX: 2,
      },
    }}
  />

  {/* Outlined chip */}
  <Chip
    label="Outlined"
    variant="outlined"
    sx={{
      borderColor: 'outline.main',
      color: 'onSurface.main',
      borderRadius: 2,
      height: 32,
      '&:hover': {
        backgroundColor: 'surfaceVariant.main',
      },
    }}
  />

  {/* Chip with icon */}
  <Chip
    icon={<Face />}
    label="With Icon"
    sx={{
      backgroundColor: 'tertiaryContainer.main',
      color: 'onTertiaryContainer.main',
      borderRadius: 2,
      height: 32,
    }}
  />

  {/* Deletable chip */}
  <Chip
    label="Deletable"
    onDelete={handleDelete}
    deleteIcon={<Done />}
    sx={{
      backgroundColor: 'primaryContainer.main',
      color: 'onPrimaryContainer.main',
      borderRadius: 2,
      height: 32,
    }}
  />
</Stack>
```

---

## Component States

### Interactive States

```typescript
// ✅ CORRECT: Comprehensive state styling
const buttonStates = {
  // Default state
  backgroundColor: 'primary.main',
  color: 'onPrimary.main',

  // Hover state
  '&:hover': {
    backgroundColor: 'primary.dark',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },

  // Focus state
  '&:focus': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: '2px',
  },

  // Active/Pressed state
  '&:active': {
    backgroundColor: 'primary.dark',
    transform: 'scale(0.98)',
  },

  // Disabled state
  '&:disabled': {
    backgroundColor: 'onSurface.main',
    color: 'surface.main',
    opacity: 0.38,
    cursor: 'not-allowed',
  },
};

// Usage
<Button sx={buttonStates}>
  Interactive Button
</Button>
```

### Loading States

```typescript
import { Button, CircularProgress } from '@mui/material';

// ✅ CORRECT: Loading button state
<Button
  variant="contained"
  disabled={loading}
  startIcon={loading ? <CircularProgress size={20} /> : null}
  sx={{
    borderRadius: 5,
    height: 40,
    minWidth: 120,
  }}
>
  {loading ? 'Loading...' : 'Submit'}
</Button>
```

---

## Implementation Checklist

### Navigation
- [ ] Use 64px height for app bars
- [ ] Implement 360px width for navigation drawers
- [ ] Use 80px height for bottom navigation
- [ ] Apply proper selected states for navigation items

### Actions
- [ ] Use filled buttons for primary actions
- [ ] Use outlined buttons for secondary actions
- [ ] Use text buttons for tertiary actions
- [ ] Ensure 48px minimum touch targets for icon buttons

### Inputs
- [ ] Apply consistent border radius (4px for text fields)
- [ ] Use proper focus states with 2px border width
- [ ] Implement 48px touch targets for checkboxes/radios
- [ ] Use standard switch dimensions (52x32px)

### Feedback
- [ ] Use 28px border radius for dialogs
- [ ] Position snackbars at bottom-left
- [ ] Apply proper elevation for modals
- [ ] Use consistent progress indicator styling

### Data Display
- [ ] Use 12px border radius for cards
- [ ] Apply proper list item spacing and hover states
- [ ] Use 8px border radius for chips
- [ ] Implement consistent typography hierarchy

---

## Common Pitfalls

### ❌ Don't Do
- Use custom button heights instead of 40px standard
- Apply inconsistent border radius across components
- Ignore touch target minimums (48px)
- Use arbitrary spacing instead of 4dp multiples
- Mix different elevation levels inappropriately

### ✅ Do
- Follow Material Design 3 component specifications exactly
- Use consistent state styling across all interactive elements
- Apply proper focus indicators for accessibility
- Use semantic color roles for all component styling
- Test touch targets on mobile devices

---

## Official Resources

- [Material Design 3 Components](https://m3.material.io/components)
- [Material-UI Component API](https://mui.com/material-ui/api/)
- [Material Design 3 Interaction States](https://m3.material.io/foundations/interaction/states)
- [Material Design 3 Navigation](https://m3.material.io/components/navigation-drawer)
- [Material Design 3 Buttons](https://m3.material.io/components/buttons)
