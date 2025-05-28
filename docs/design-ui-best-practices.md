# Design & UI Best Practices
*Comprehensive guide based on unwrapped.fm project patterns*

## Material Design 3 Standards

### Core MD3 Principles

#### Design Philosophy
- **Adaptive**: Responds to user needs and context
- **Expressive**: Reflects brand personality while maintaining usability
- **Personal**: Tailors experiences to individual users
- **Accessible**: Inclusive design for all users

#### Key Design Tokens
- **Color**: Semantic color roles, not literal values
- **Typography**: Complete type scale with proper hierarchy
- **Spacing**: 4dp base unit system
- **Shape**: Rounded corners with consistent radius values
- **Elevation**: Proper layering and depth

### Color System Implementation

#### Semantic Color Roles (Mandatory)
```typescript
// ✅ CORRECT: Use semantic color roles
const theme = createTheme({
  palette: {
    primary: {
      main: '#1DB954',      // Primary brand color
      light: '#1ed760',     // Lighter variant
      dark: '#1aa34a',      // Darker variant
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#191414',      // Secondary brand color
      light: '#2a2a2a',
      dark: '#000000',
      contrastText: '#ffffff'
    },
    error: {
      main: '#f44336',      // Error states
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#ff9800',      // Warning states
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000'
    },
    success: {
      main: '#4caf50',      // Success states
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff'
    },
    background: {
      default: '#121212',   // App background
      paper: '#1e1e1e'      // Surface background
    },
    text: {
      primary: '#ffffff',                    // Primary text
      secondary: 'rgba(255, 255, 255, 0.7)' // Secondary text
    }
  }
});

// ✅ CORRECT: Component usage with semantic colors
<Button color="primary">Primary Action</Button>
<Alert severity="error">Error message</Alert>
<Chip color="success">Success state</Chip>

// ❌ INCORRECT: Literal color values
<Button sx={{ backgroundColor: '#1976d2' }}>Button</Button>
<Alert sx={{ color: '#f44336' }}>Error</Alert>
```

#### Color Accessibility Requirements
- **Contrast Ratios**: 4.5:1 minimum for normal text, 3:1 for large text
- **Color Independence**: Never rely solely on color to convey information
- **Dark Mode Support**: Provide appropriate contrast in both light and dark themes

```typescript
// ✅ CORRECT: Accessible color usage
<Typography
  variant="bodyLarge"
  color="text.primary"  // High contrast
>
  Important information
</Typography>

<Typography
  variant="bodyMedium"
  color="text.secondary"  // Lower contrast but still accessible
>
  Supporting information
</Typography>

// ✅ CORRECT: Error state with icon and color
<Alert severity="error" icon={<ErrorIcon />}>
  Error message with both visual and textual indicators
</Alert>

// ❌ INCORRECT: Color-only indication
<Typography sx={{ color: 'red' }}>
  Error (relies only on color)
</Typography>
```

### Typography Scale (Complete MD3 Implementation)

#### Typography Hierarchy
```typescript
// Complete MD3 Typography Scale
const typography = {
  // Display styles - Large, impactful text
  displayLarge: {
    fontSize: '3.5rem',    // 56px
    fontWeight: 400,
    lineHeight: 1.12,
    letterSpacing: '-0.25px',
    // Use for: Hero headlines, major page titles
  },
  displayMedium: {
    fontSize: '2.8rem',    // 45px
    fontWeight: 400,
    lineHeight: 1.16,
    letterSpacing: '0px',
    // Use for: Section headlines
  },
  displaySmall: {
    fontSize: '2.25rem',   // 36px
    fontWeight: 400,
    lineHeight: 1.22,
    letterSpacing: '0px',
    // Use for: Subsection headlines
  },

  // Headline styles - Prominent text
  headlineLarge: {
    fontSize: '2rem',      // 32px
    fontWeight: 400,
    lineHeight: 1.25,
    letterSpacing: '0px',
    // Use for: Page titles, major headings
  },
  headlineMedium: {
    fontSize: '1.75rem',   // 28px
    fontWeight: 400,
    lineHeight: 1.29,
    letterSpacing: '0px',
    // Use for: Section headings
  },
  headlineSmall: {
    fontSize: '1.5rem',    // 24px
    fontWeight: 400,
    lineHeight: 1.33,
    letterSpacing: '0px',
    // Use for: Subsection headings
  },

  // Title styles - Medium emphasis
  titleLarge: {
    fontSize: '1.375rem',  // 22px
    fontWeight: 400,
    lineHeight: 1.27,
    letterSpacing: '0px',
    // Use for: Card titles, dialog titles
  },
  titleMedium: {
    fontSize: '1rem',      // 16px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.15px',
    // Use for: List item titles, form section titles
  },
  titleSmall: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 500,
    lineHeight: 1.43,
    letterSpacing: '0.1px',
    // Use for: Small card titles, tab labels
  },

  // Body styles - Main content
  bodyLarge: {
    fontSize: '1rem',      // 16px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.5px',
    // Use for: Primary body text, descriptions
  },
  bodyMedium: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0.25px',
    // Use for: Secondary body text, captions
  },
  bodySmall: {
    fontSize: '0.75rem',   // 12px
    fontWeight: 400,
    lineHeight: 1.33,
    letterSpacing: '0.4px',
    // Use for: Fine print, metadata
  },

  // Label styles - UI elements
  labelLarge: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 500,
    lineHeight: 1.43,
    letterSpacing: '0.1px',
    // Use for: Button text, prominent labels
  },
  labelMedium: {
    fontSize: '0.75rem',   // 12px
    fontWeight: 500,
    lineHeight: 1.33,
    letterSpacing: '0.5px',
    // Use for: Form labels, navigation labels
  },
  labelSmall: {
    fontSize: '0.6875rem', // 11px
    fontWeight: 500,
    lineHeight: 1.45,
    letterSpacing: '0.5px',
    // Use for: Small labels, badges
  }
};
```

#### Typography Usage Examples
```typescript
// ✅ CORRECT: Proper typography hierarchy
<Typography variant="displayLarge">
  unwrapped.fm
</Typography>

<Typography variant="headlineMedium">
  Your Music Analysis
</Typography>

<Typography variant="bodyLarge">
  Based on your listening history from the past year, here's what we discovered about your music taste.
</Typography>

<Typography variant="labelMedium" component="label">
  Email Address
</Typography>

// ❌ INCORRECT: Custom font sizes
<Typography sx={{ fontSize: '24px', fontWeight: 'bold' }}>
  Custom Heading
</Typography>
```

### Spacing System (4dp Base Unit)

#### Spacing Scale
```typescript
// 4dp base unit system
const spacing = {
  0: '0px',      // 0dp
  1: '4px',      // 4dp
  2: '8px',      // 8dp
  3: '12px',     // 12dp
  4: '16px',     // 16dp
  5: '20px',     // 20dp
  6: '24px',     // 24dp
  8: '32px',     // 32dp
  10: '40px',    // 40dp
  12: '48px',    // 48dp
  16: '64px',    // 64dp
  20: '80px',    // 80dp
  24: '96px',    // 96dp
};

// ✅ CORRECT: Use spacing multiples
<Box sx={{
  padding: 3,        // 12px
  margin: 2,         // 8px
  gap: 1,           // 4px
  marginTop: 6,     // 24px
}}>
  Content
</Box>

<Stack spacing={2}>   {/* 8px spacing between items */}
  <Component1 />
  <Component2 />
  <Component3 />
</Stack>

// ❌ INCORRECT: Arbitrary spacing values
<Box sx={{
  padding: '15px',   // Not a 4dp multiple
  margin: '7px',     // Not a 4dp multiple
  gap: '13px',       // Not a 4dp multiple
}}>
  Content
</Box>
```

#### Layout Spacing Guidelines
- **Component Internal Spacing**: Use smaller values (1-3)
- **Component External Spacing**: Use medium values (2-6)
- **Section Spacing**: Use larger values (6-12)
- **Page Layout Spacing**: Use largest values (12-24)

### Shape and Elevation

#### Border Radius System
```typescript
const shape = {
  borderRadius: {
    none: 0,
    small: 4,      // Small components
    medium: 8,     // Cards, buttons
    large: 12,     // Prominent surfaces
    extraLarge: 16, // Hero sections
    full: 9999,    // Pills, circular elements
  }
};

// ✅ CORRECT: Consistent border radius
<Card sx={{ borderRadius: 2 }}>  {/* 8px */}
  Card content
</Card>

<Button sx={{ borderRadius: 5 }}>  {/* 20px - pill shape */}
  Pill Button
</Button>

<Avatar sx={{ borderRadius: '50%' }}>  {/* Circular */}
  User
</Avatar>
```

#### Elevation Levels
```typescript
// MD3 Elevation Scale
const elevation = {
  0: 'none',                    // No elevation
  1: '0px 1px 3px rgba(0,0,0,0.12)', // Subtle lift
  2: '0px 1px 5px rgba(0,0,0,0.2)',  // Cards
  3: '0px 1px 8px rgba(0,0,0,0.24)', // Raised elements
  4: '0px 1px 10px rgba(0,0,0,0.28)', // Modals, dialogs
  5: '0px 1px 14px rgba(0,0,0,0.32)', // Navigation drawers
};

// ✅ CORRECT: Appropriate elevation usage
<Card elevation={2}>           {/* Standard card elevation */}
  Card content
</Card>

<Dialog elevation={4}>         {/* Modal elevation */}
  Dialog content
</Dialog>

<AppBar elevation={0}>         {/* Flat app bar */}
  Navigation
</AppBar>
```

## Component Standards

### Button Hierarchy (Mandatory)

#### Button Types and Usage
```typescript
// ✅ CORRECT: MD3 button hierarchy

// 1. Filled Button - Primary actions
<Button variant="contained" color="primary">
  Start Analysis
</Button>

// 2. Outlined Button - Secondary actions
<Button variant="outlined" color="primary">
  Learn More
</Button>

// 3. Text Button - Tertiary actions
<Button variant="text" color="primary">
  Cancel
</Button>

// 4. Icon Button - Compact actions
<IconButton aria-label="Share results">
  <ShareIcon />
</IconButton>

// 5. Floating Action Button - Primary screen action
<Fab color="primary" aria-label="Add">
  <AddIcon />
</Fab>
```

#### Button Sizing and Touch Targets
```typescript
// ✅ CORRECT: Proper touch targets (48px minimum)
<Button
  variant="contained"
  sx={{
    minHeight: 48,    // Touch target height
    minWidth: 64,     // Minimum width
    paddingX: 3,      // 12px horizontal padding
  }}
>
  Action
</Button>

<IconButton
  sx={{
    width: 48,        // Touch target size
    height: 48,
  }}
  aria-label="Menu"
>
  <MenuIcon />
</IconButton>

// ❌ INCORRECT: Small touch targets
<Button sx={{ height: 32, padding: 1 }}>
  Small Button
</Button>
```

### Form Components

#### Input Field Standards
```typescript
// ✅ CORRECT: Accessible form fields
<TextField
  label="Email Address"
  type="email"
  required
  fullWidth
  variant="outlined"
  helperText="We'll never share your email"
  aria-describedby="email-helper-text"
  error={!!emailError}
  helperText={emailError || "We'll never share your email"}
/>

// ✅ CORRECT: Form field grouping
<FormControl component="fieldset">
  <FormLabel component="legend">Music Preferences</FormLabel>
  <FormGroup>
    <FormControlLabel
      control={<Checkbox checked={rock} onChange={handleRockChange} />}
      label="Rock"
    />
    <FormControlLabel
      control={<Checkbox checked={jazz} onChange={handleJazzChange} />}
      label="Jazz"
    />
  </FormGroup>
</FormControl>
```

### Navigation Components

#### App Bar and Navigation
```typescript
// ✅ CORRECT: Accessible navigation
<AppBar position="static" elevation={0}>
  <Toolbar>
    <Typography variant="titleLarge" component="h1" sx={{ flexGrow: 1 }}>
      unwrapped.fm
    </Typography>

    <IconButton
      color="inherit"
      aria-label="User menu"
      onClick={handleMenuOpen}
    >
      <AccountCircleIcon />
    </IconButton>
  </Toolbar>
</AppBar>

// ✅ CORRECT: Breadcrumb navigation
<Breadcrumbs aria-label="breadcrumb">
  <Link color="inherit" href="/">
    Home
  </Link>
  <Link color="inherit" href="/analysis">
    Analysis
  </Link>
  <Typography color="text.primary">Results</Typography>
</Breadcrumbs>
```

### Data Display Components

#### Cards and Lists
```typescript
// ✅ CORRECT: Accessible card design
<Card elevation={2} sx={{ borderRadius: 2 }}>
  <CardHeader
    title="Your Top Artist"
    subheader="Based on listening time"
    titleTypographyProps={{ variant: 'titleLarge' }}
    subheaderTypographyProps={{ variant: 'bodyMedium' }}
  />
  <CardContent>
    <Typography variant="bodyLarge">
      Artist information and statistics
    </Typography>
  </CardContent>
  <CardActions>
    <Button size="small" color="primary">
      View Details
    </Button>
    <Button size="small" color="primary">
      Share
    </Button>
  </CardActions>
</Card>

// ✅ CORRECT: Accessible list design
<List>
  {tracks.map((track, index) => (
    <ListItem key={track.id} divider>
      <ListItemAvatar>
        <Avatar src={track.albumCover} alt={`${track.album} cover`} />
      </ListItemAvatar>
      <ListItemText
        primary={track.name}
        secondary={track.artist}
        primaryTypographyProps={{ variant: 'titleMedium' }}
        secondaryTypographyProps={{ variant: 'bodyMedium' }}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label={`Play ${track.name}`}
          onClick={() => handlePlay(track.id)}
        >
          <PlayArrowIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  ))}
</List>
```

## Accessibility Guidelines (WCAG 2.1 AA)

### Keyboard Navigation

#### Focus Management
```typescript
// ✅ CORRECT: Proper focus management
function Modal({ open, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && modalRef.current) {
      // Focus first focusable element when modal opens
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }

    // Trap focus within modal
    if (event.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      ref={modalRef}
      onKeyDown={handleKeyDown}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {children}
    </Dialog>
  );
}
```

#### Skip Links and Landmarks
```typescript
// ✅ CORRECT: Skip links for keyboard users
<Box component="nav" aria-label="Skip links">
  <Link
    href="#main-content"
    sx={{
      position: 'absolute',
      left: '-9999px',
      '&:focus': {
        position: 'static',
        left: 'auto',
      }
    }}
  >
    Skip to main content
  </Link>
</Box>

// ✅ CORRECT: Semantic HTML structure
<Box component="main" id="main-content">
  <Box component="section" aria-labelledby="results-heading">
    <Typography variant="headlineLarge" id="results-heading" component="h1">
      Your Music Analysis Results
    </Typography>
    {/* Content */}
  </Box>
</Box>
```

### Screen Reader Support

#### ARIA Labels and Descriptions
```typescript
// ✅ CORRECT: Comprehensive ARIA support
<Button
  aria-label="Start music analysis for your Spotify account"
  aria-describedby="analysis-description"
  onClick={handleStartAnalysis}
>
  Analyze My Music
</Button>

<Typography id="analysis-description" variant="bodySmall" color="text.secondary">
  This will analyze your listening history from the past year
</Typography>

// ✅ CORRECT: Live regions for dynamic content
<Box
  role="status"
  aria-live="polite"
  aria-label="Analysis progress"
>
  {analysisStatus && (
    <Typography variant="bodyMedium">
      {getStatusMessage(analysisStatus)}
    </Typography>
  )}
</Box>

// ✅ CORRECT: Form field associations
<FormControl>
  <FormLabel id="genre-preferences-label">
    Favorite Genres
  </FormLabel>
  <RadioGroup
    aria-labelledby="genre-preferences-label"
    value={selectedGenre}
    onChange={handleGenreChange}
  >
    <FormControlLabel value="rock" control={<Radio />} label="Rock" />
    <FormControlLabel value="jazz" control={<Radio />} label="Jazz" />
    <FormControlLabel value="electronic" control={<Radio />} label="Electronic" />
  </RadioGroup>
</FormControl>
```

#### Image Accessibility
```typescript
// ✅ CORRECT: Descriptive alt text
<Avatar
  src={artist.imageUrl}
  alt={`${artist.name} artist photo`}
  sx={{ width: 64, height: 64 }}
/>

// ✅ CORRECT: Decorative images
<Box
  component="img"
  src="/decorative-pattern.svg"
  alt=""  // Empty alt for decorative images
  aria-hidden="true"
/>

// ✅ CORRECT: Complex images with descriptions
<Box>
  <img
    src="/music-chart.png"
    alt="Bar chart showing listening hours by genre"
    aria-describedby="chart-description"
  />
  <Typography id="chart-description" variant="bodySmall">
    Rock: 45 hours, Pop: 32 hours, Jazz: 28 hours, Electronic: 15 hours
  </Typography>
</Box>
```

### Color and Contrast

#### Contrast Requirements
```typescript
// ✅ CORRECT: High contrast text
<Typography
  variant="bodyLarge"
  sx={{
    color: 'text.primary',  // Ensures 4.5:1 contrast ratio
    backgroundColor: 'background.paper'
  }}
>
  Primary content text
</Typography>

// ✅ CORRECT: Large text with 3:1 contrast
<Typography
  variant="headlineLarge"
  sx={{
    color: 'text.secondary',  // 3:1 contrast acceptable for large text
    backgroundColor: 'background.default'
  }}
>
  Large heading text
</Typography>

// ✅ CORRECT: Interactive elements with focus indicators
<Button
  variant="outlined"
  sx={{
    '&:focus': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    }
  }}
>
  Focusable Button
</Button>
```

## UX Patterns

### Loading States

#### Progressive Loading Pattern
```typescript
// ✅ CORRECT: Informative loading states
function LoadingScreen() {
  const [loadingStage, setLoadingStage] = useState<'connecting' | 'fetching' | 'analyzing'>('connecting');

  const getLoadingMessage = () => {
    switch (loadingStage) {
      case 'connecting':
        return 'Connecting to your Spotify account...';
      case 'fetching':
        return 'Gathering your music data...';
      case 'analyzing':
        return 'Analyzing your music taste...';
      default:
        return 'Loading...';
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
    >
      <CircularProgress size={60} />
      <Typography variant="titleLarge" textAlign="center">
        {getLoadingMessage()}
      </Typography>
      <Typography variant="bodyMedium" color="text.secondary" textAlign="center">
        This may take a few moments...
      </Typography>
    </Box>
  );
}

// ❌ INCORRECT: Generic loading
<Box>
  <CircularProgress />
  <Typography>Loading...</Typography>
</Box>
```

#### Skeleton Loading
```typescript
// ✅ CORRECT: Skeleton loading for content
function TrackListSkeleton() {
  return (
    <List>
      {Array.from({ length: 5 }).map((_, index) => (
        <ListItem key={index}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={40} height={40} />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton variant="text" width="60%" />}
            secondary={<Skeleton variant="text" width="40%" />}
          />
        </ListItem>
      ))}
    </List>
  );
}
```

### Error States

#### Helpful Error Messages
```typescript
// ✅ CORRECT: Actionable error messages
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const getErrorMessage = (error: Error) => {
    if (error.message.includes('network')) {
      return {
        title: 'Connection Problem',
        message: 'Please check your internet connection and try again.',
        action: 'Retry'
      };
    }

    if (error.message.includes('spotify')) {
      return {
        title: 'Spotify Connection Issue',
        message: 'We couldn\'t connect to your Spotify account. Please log in again.',
        action: 'Reconnect'
      };
    }

    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again.',
      action: 'Retry'
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
      gap={3}
      textAlign="center"
    >
      <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
      <Typography variant="headlineSmall">
        {errorInfo.title}
      </Typography>
      <Typography variant="bodyLarge" color="text.secondary">
        {errorInfo.message}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={onRetry}
        startIcon={<RefreshIcon />}
      >
        {errorInfo.action}
      </Button>
    </Box>
  );
}

// ❌ INCORRECT: Generic error message
<Typography color="error">
  Error occurred
</Typography>
```

### Empty States

#### Encouraging Empty States
```typescript
// ✅ CORRECT: Helpful empty state
function EmptyPlaylistState() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="40vh"
      gap={3}
      textAlign="center"
      padding={4}
    >
      <MusicNoteIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
      <Typography variant="headlineSmall">
        No Music Found
      </Typography>
      <Typography variant="bodyLarge" color="text.secondary">
        We couldn't find any music in your Spotify account.
        Try listening to some songs and come back!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        href="https://open.spotify.com"
        target="_blank"
        startIcon={<OpenInNewIcon />}
      >
        Open Spotify
      </Button>
    </Box>
  );
}
```

### Feedback and Confirmation

#### Success States
```typescript
// ✅ CORRECT: Clear success feedback
function SuccessMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Alert
      severity="success"
      onClose={onDismiss}
      sx={{ marginBottom: 2 }}
    >
      <AlertTitle>Success!</AlertTitle>
      {message}
    </Alert>
  );
}

// ✅ CORRECT: Confirmation dialogs
function DeleteConfirmationDialog({ open, onClose, onConfirm, itemName }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Analysis?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete "{itemName}"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

## Content Guidelines

### Language and Tone

#### Writing Principles
- **Clear and Concise**: Use simple, direct language
- **Action-Oriented**: Use active voice and clear calls to action
- **Helpful**: Provide context and guidance
- **Consistent**: Use the same terms throughout the application
- **Inclusive**: Use inclusive language that welcomes all users

#### Voice and Tone Examples
```typescript
// ✅ CORRECT: Clear, helpful language
<Typography variant="headlineMedium">
  Your Music Analysis is Ready!
</Typography>

<Typography variant="bodyLarge">
  We've analyzed your listening habits and discovered some interesting patterns.
  Scroll down to see what your music taste says about you.
</Typography>

<Button variant="contained" color="primary">
  View My Results
</Button>

// ❌ INCORRECT: Vague, technical language
<Typography variant="headlineMedium">
  Analysis Complete
</Typography>

<Typography variant="bodyLarge">
  Data processing has finished. Results are available for viewing.
</Typography>

<Button variant="contained" color="primary">
  Access Data
</Button>
```

### Error Messaging

#### Error Message Guidelines
```typescript
// ✅ CORRECT: Helpful error messages
const errorMessages = {
  networkError: {
    title: "Connection Problem",
    message: "Please check your internet connection and try again.",
    action: "Retry"
  },
  authError: {
    title: "Login Required",
    message: "Please log in to your Spotify account to continue.",
    action: "Log In"
  },
  validationError: {
    title: "Invalid Email",
    message: "Please enter a valid email address (example: user@domain.com).",
    action: "Fix Email"
  },
  serverError: {
    title: "Server Temporarily Unavailable",
    message: "Our servers are experiencing high traffic. Please try again in a few minutes.",
    action: "Try Again"
  }
};

// ❌ INCORRECT: Technical error messages
const badErrorMessages = {
  networkError: "ERR_NETWORK_TIMEOUT",
  authError: "401 Unauthorized",
  validationError: "Invalid input format",
  serverError: "Internal server error 500"
};
```

### Microcopy and Labels

#### Form Labels and Help Text
```typescript
// ✅ CORRECT: Clear, helpful form labels
<TextField
  label="Email Address"
  helperText="We'll use this to send you your analysis results"
  placeholder="your.email@example.com"
  required
/>

<FormControlLabel
  control={<Checkbox />}
  label="Send me updates about new features"
/>

<Button variant="contained" color="primary">
  Start My Music Analysis
</Button>

// ❌ INCORRECT: Unclear labels
<TextField
  label="Email"
  helperText="Required field"
  placeholder="Enter email"
  required
/>

<FormControlLabel
  control={<Checkbox />}
  label="Marketing emails"
/>

<Button variant="contained" color="primary">
  Submit
</Button>
```

#### Button Labels
```typescript
// ✅ CORRECT: Action-oriented button labels
<Button variant="contained" color="primary">
  Connect Spotify Account
</Button>

<Button variant="outlined" color="primary">
  Learn How It Works
</Button>

<Button variant="text" color="primary">
  Maybe Later
</Button>

// ❌ INCORRECT: Generic button labels
<Button variant="contained" color="primary">
  OK
</Button>

<Button variant="outlined" color="primary">
  More Info
</Button>

<Button variant="text" color="primary">
  No
</Button>
```

### Loading and Status Messages

#### Progressive Disclosure
```typescript
// ✅ CORRECT: Informative status messages
const statusMessages = {
  connecting: "Connecting to your Spotify account...",
  authenticating: "Verifying your credentials...",
  fetching: "Gathering your music data (this may take a moment)...",
  processing: "Analyzing your listening patterns...",
  generating: "Creating your personalized analysis...",
  complete: "Your analysis is ready!"
};

// ✅ CORRECT: Context-aware messages
function getLoadingMessage(tracksCount: number) {
  if (tracksCount === 0) {
    return "Starting to gather your music data...";
  } else if (tracksCount < 100) {
    return `Found ${tracksCount} tracks, continuing to search...`;
  } else {
    return `Analyzing ${tracksCount} tracks from your library...`;
  }
}
```

## Implementation Checklist

### Design System Compliance
- [ ] Use semantic color roles from theme
- [ ] Apply correct MD3 typography variants
- [ ] Use 4dp spacing multiples consistently
- [ ] Implement proper elevation levels
- [ ] Apply consistent border radius values

### Accessibility Compliance
- [ ] Ensure 4.5:1 contrast ratio for normal text
- [ ] Ensure 3:1 contrast ratio for large text
- [ ] Provide 48px minimum touch targets
- [ ] Add proper ARIA labels and descriptions
- [ ] Implement keyboard navigation support
- [ ] Test with screen readers
- [ ] Provide alternative text for images
- [ ] Use semantic HTML structure

### UX Pattern Implementation
- [ ] Provide informative loading states
- [ ] Create helpful error messages with clear actions
- [ ] Design encouraging empty states
- [ ] Implement proper feedback for user actions
- [ ] Use progressive disclosure for complex processes

### Content Quality
- [ ] Write clear, action-oriented copy
- [ ] Use consistent terminology throughout
- [ ] Provide helpful error messages
- [ ] Create informative loading messages
- [ ] Use inclusive language

## Summary

This design system provides:

- **🎨 Complete MD3 Implementation**: Full Material Design 3 compliance
- **♿ Accessibility Excellence**: WCAG 2.1 AA standards throughout
- **🎯 User-Centered Design**: Clear, helpful, and actionable interfaces
- **📝 Content Quality**: Clear, consistent, and inclusive language
- **🔧 Implementation Guidance**: Practical examples and checklists
- **📱 Responsive Design**: Mobile-first approach with proper touch targets
- **🌟 Consistent Experience**: Unified design language across all components

Follow these guidelines to create interfaces that are beautiful, accessible, and user-friendly.
