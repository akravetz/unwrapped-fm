# Material Design 3 Content & Accessibility Guidelines

## Quick Reference

### UX Writing Principles
- **Clear**: Use simple, direct language
- **Concise**: Remove unnecessary words
- **Useful**: Provide actionable information
- **Consistent**: Use the same terms throughout

### Accessibility Standards
- **WCAG 2.1 AA**: Minimum compliance level
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Touch Targets**: Minimum 44px (48px recommended)
- **Keyboard Navigation**: All interactive elements accessible

### Content Hierarchy
- **Display**: Hero headlines and marketing
- **Headline**: Page and section titles
- **Title**: Component and card titles
- **Body**: Main content and descriptions
- **Label**: UI elements and buttons

---

## UX Writing Guidelines

### Voice and Tone

Material Design 3 emphasizes clear, helpful, and human communication:

```typescript
// ✅ CORRECT: Clear and helpful
<Button>Save changes</Button>
<Typography>Your profile has been updated successfully.</Typography>
<TextField
  label="Email address"
  helperText="We'll use this to send you important updates"
/>

// ❌ INCORRECT: Vague or technical
<Button>Execute operation</Button>
<Typography>Profile modification process completed.</Typography>
<TextField
  label="Email"
  helperText="Required field for system notifications"
/>
```

### Writing Principles

#### 1. Be Clear and Direct
```typescript
// ✅ CORRECT: Clear instructions
<Alert severity="error">
  Please enter a valid email address to continue.
</Alert>

<Button disabled={!isValid}>
  {isValid ? 'Continue' : 'Enter email to continue'}
</Button>

// ❌ INCORRECT: Unclear or confusing
<Alert severity="error">
  Invalid input detected in email field.
</Alert>

<Button disabled={!isValid}>
  Proceed
</Button>
```

#### 2. Use Active Voice
```typescript
// ✅ CORRECT: Active voice
<Typography variant="bodyMedium">
  You can change your password in Settings.
</Typography>

<Snackbar message="File uploaded successfully" />

// ❌ INCORRECT: Passive voice
<Typography variant="bodyMedium">
  Your password can be changed in Settings.
</Typography>

<Snackbar message="File has been uploaded" />
```

#### 3. Write for Your Audience
```typescript
// ✅ CORRECT: User-friendly language
<Dialog>
  <DialogTitle>Delete this item?</DialogTitle>
  <DialogContent>
    This action cannot be undone. The item will be permanently removed.
  </DialogContent>
  <DialogActions>
    <Button>Cancel</Button>
    <Button color="error">Delete</Button>
  </DialogActions>
</Dialog>

// ❌ INCORRECT: Technical jargon
<Dialog>
  <DialogTitle>Confirm deletion operation</DialogTitle>
  <DialogContent>
    This operation will permanently remove the selected entity from the database.
  </DialogContent>
  <DialogActions>
    <Button>Abort</Button>
    <Button color="error">Execute</Button>
  </DialogActions>
</Dialog>
```

### Microcopy Patterns

#### Button Labels
```typescript
// ✅ CORRECT: Action-oriented button labels
<Stack direction="row" spacing={2}>
  <Button variant="contained">Save changes</Button>
  <Button variant="outlined">Cancel</Button>
  <Button variant="text">Learn more</Button>
</Stack>

// Form actions
<Stack direction="row" spacing={2}>
  <Button variant="contained">Create account</Button>
  <Button variant="outlined">Sign in instead</Button>
</Stack>

// Destructive actions
<Stack direction="row" spacing={2}>
  <Button variant="outlined">Keep</Button>
  <Button variant="contained" color="error">Delete forever</Button>
</Stack>
```

#### Error Messages
```typescript
// ✅ CORRECT: Helpful error messages
<TextField
  error
  label="Password"
  helperText="Password must be at least 8 characters long"
/>

<Alert severity="error">
  <AlertTitle>Unable to save changes</AlertTitle>
  Please check your internet connection and try again.
</Alert>

// ❌ INCORRECT: Unhelpful error messages
<TextField
  error
  label="Password"
  helperText="Invalid input"
/>

<Alert severity="error">
  Error 400: Bad Request
</Alert>
```

#### Loading and Empty States
```typescript
// ✅ CORRECT: Informative loading states
<Box sx={{ textAlign: 'center', padding: 4 }}>
  <CircularProgress />
  <Typography variant="bodyMedium" sx={{ mt: 2 }}>
    Loading your music library...
  </Typography>
</Box>

// Empty states
<Box sx={{ textAlign: 'center', padding: 4 }}>
  <Typography variant="headlineSmall" sx={{ mb: 1 }}>
    No songs found
  </Typography>
  <Typography variant="bodyMedium" color="text.secondary">
    Try adjusting your search or browse our recommendations.
  </Typography>
  <Button variant="contained" sx={{ mt: 2 }}>
    Browse music
  </Button>
</Box>
```

#### Form Labels and Help Text
```typescript
// ✅ CORRECT: Clear labels and helpful text
<Stack spacing={3}>
  <TextField
    label="Display name"
    helperText="This is how others will see you"
    fullWidth
  />

  <TextField
    label="Email address"
    helperText="We'll send important updates here"
    type="email"
    fullWidth
  />

  <FormControlLabel
    control={<Checkbox />}
    label="Send me weekly music recommendations"
  />
</Stack>
```

---

## Content Hierarchy

### Typography Usage

#### Display Typography
```typescript
// ✅ CORRECT: Use for hero sections and marketing
<Typography variant="displayLarge" component="h1" sx={{ mb: 2 }}>
  Discover Your Music DNA
</Typography>

<Typography variant="displayMedium" component="h1" sx={{ mb: 2 }}>
  Welcome Back
</Typography>
```

#### Headline Typography
```typescript
// ✅ CORRECT: Use for page and section titles
<Typography variant="headlineLarge" component="h1" sx={{ mb: 3 }}>
  Your Music Analysis
</Typography>

<Typography variant="headlineMedium" component="h2" sx={{ mb: 2 }}>
  Top Artists This Year
</Typography>

<Typography variant="headlineSmall" component="h3" sx={{ mb: 2 }}>
  Recent Activity
</Typography>
```

#### Title Typography
```typescript
// ✅ CORRECT: Use for component and card titles
<Card>
  <CardContent>
    <Typography variant="titleLarge" component="h2" sx={{ mb: 1 }}>
      Listening Habits
    </Typography>
    <Typography variant="titleMedium" sx={{ mb: 1 }}>
      Most Played Genre
    </Typography>
    <Typography variant="titleSmall" color="text.secondary">
      Electronic • 45% of listening time
    </Typography>
  </CardContent>
</Card>
```

#### Body Typography
```typescript
// ✅ CORRECT: Use for main content
<Stack spacing={2}>
  <Typography variant="bodyLarge">
    Your music taste shows a strong preference for electronic and indie rock,
    with occasional ventures into jazz and classical music.
  </Typography>

  <Typography variant="bodyMedium">
    Based on your listening patterns, you tend to discover new music through
    algorithmic recommendations rather than social sharing.
  </Typography>

  <Typography variant="bodySmall" color="text.secondary">
    Analysis based on 1,247 tracks played in the last 12 months.
  </Typography>
</Stack>
```

#### Label Typography
```typescript
// ✅ CORRECT: Use for UI elements
<Stack spacing={2}>
  <Button>
    <Typography variant="labelLarge">Primary Action</Typography>
  </Button>

  <Chip
    label={<Typography variant="labelMedium">Genre Tag</Typography>}
  />

  <Typography variant="labelSmall" color="text.secondary">
    Last updated 2 hours ago
  </Typography>
</Stack>
```

### Information Architecture

#### Content Organization
```typescript
// ✅ CORRECT: Logical content hierarchy
<Container maxWidth="lg">
  {/* Page header */}
  <Box sx={{ mb: 4 }}>
    <Typography variant="headlineLarge" component="h1" sx={{ mb: 1 }}>
      Music Analysis Results
    </Typography>
    <Typography variant="bodyLarge" color="text.secondary">
      Insights from your listening history over the past year
    </Typography>
  </Box>

  {/* Main content sections */}
  <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
      {/* Primary content */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="titleLarge" sx={{ mb: 2 }}>
            Your Music Personality
          </Typography>
          <Typography variant="bodyMedium">
            Main analysis content...
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={4}>
      {/* Secondary content */}
      <Card>
        <CardContent>
          <Typography variant="titleMedium" sx={{ mb: 2 }}>
            Quick Stats
          </Typography>
          <Typography variant="bodySmall">
            Supporting information...
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Container>
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color Contrast Requirements
```typescript
// ✅ CORRECT: Proper contrast ratios
const theme = createTheme({
  palette: {
    text: {
      primary: '#000000',    // 21:1 contrast on white
      secondary: '#666666',  // 7:1 contrast on white
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',     // Sufficient contrast for text
    },
  },
});

// Usage with proper contrast
<Typography
  variant="bodyMedium"
  sx={{
    color: 'text.primary',  // Ensures 4.5:1 minimum contrast
    backgroundColor: 'background.default'
  }}
>
  Main content text
</Typography>
```

#### Focus Indicators
```typescript
// ✅ CORRECT: Visible focus indicators
<Button
  sx={{
    '&:focus': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
    '&:focus:not(:focus-visible)': {
      outline: 'none',
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
  }}
>
  Accessible Button
</Button>

// Custom focus styles for cards
<Card
  tabIndex={0}
  sx={{
    cursor: 'pointer',
    '&:focus': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: '2px',
    },
  }}
>
  <CardContent>Focusable card content</CardContent>
</Card>
```

#### Touch Targets
```typescript
// ✅ CORRECT: Minimum 44px touch targets
<IconButton
  aria-label="Add to favorites"
  sx={{
    width: 48,   // Exceeds 44px minimum
    height: 48,
    padding: 1,
  }}
>
  <Favorite />
</IconButton>

// Ensure adequate spacing between touch targets
<Stack direction="row" spacing={1}>
  <IconButton sx={{ width: 48, height: 48 }}>
    <Share />
  </IconButton>
  <IconButton sx={{ width: 48, height: 48 }}>
    <Download />
  </IconButton>
  <IconButton sx={{ width: 48, height: 48 }}>
    <MoreVert />
  </IconButton>
</Stack>
```

### ARIA Labels and Roles

#### Semantic HTML and ARIA
```typescript
// ✅ CORRECT: Proper semantic structure
<Box component="main" role="main">
  <Typography variant="headlineLarge" component="h1">
    Page Title
  </Typography>

  <Box component="section" aria-labelledby="section-title">
    <Typography variant="headlineMedium" component="h2" id="section-title">
      Section Title
    </Typography>

    <List role="list">
      <ListItem role="listitem">
        <ListItemText primary="Item 1" />
      </ListItem>
    </List>
  </Box>
</Box>

// Form accessibility
<Box component="form" role="form" aria-label="User preferences">
  <TextField
    label="Display name"
    required
    aria-describedby="name-helper"
    helperText="This is how others will see you"
    inputProps={{
      'aria-required': true,
      'aria-invalid': hasError,
    }}
  />

  <FormHelperText id="name-helper">
    This is how others will see you
  </FormHelperText>
</Box>
```

#### Interactive Elements
```typescript
// ✅ CORRECT: Accessible interactive elements
<Button
  aria-label="Delete item"
  aria-describedby="delete-description"
  onClick={handleDelete}
>
  <Delete />
</Button>
<Typography id="delete-description" sx={{ display: 'none' }}>
  This action cannot be undone
</Typography>

// Modal accessibility
<Dialog
  open={open}
  onClose={handleClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">
    Confirm Action
  </DialogTitle>
  <DialogContent>
    <Typography id="dialog-description">
      Are you sure you want to proceed?
    </Typography>
  </DialogContent>
</Dialog>

// Loading states
<Box
  role="status"
  aria-live="polite"
  aria-label="Loading content"
>
  <CircularProgress />
  <Typography sx={{ mt: 1 }}>
    Loading your music data...
  </Typography>
</Box>
```

### Keyboard Navigation

#### Tab Order and Navigation
```typescript
// ✅ CORRECT: Logical tab order
<Stack spacing={2}>
  <TextField
    label="First Name"
    tabIndex={1}
  />
  <TextField
    label="Last Name"
    tabIndex={2}
  />
  <TextField
    label="Email"
    tabIndex={3}
  />

  <Stack direction="row" spacing={2}>
    <Button
      variant="outlined"
      tabIndex={5}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      tabIndex={4}  // Primary action gets focus first
    >
      Submit
    </Button>
  </Stack>
</Stack>

// Skip links for navigation
<Box
  component="a"
  href="#main-content"
  sx={{
    position: 'absolute',
    left: '-9999px',
    '&:focus': {
      position: 'static',
      left: 'auto',
    },
  }}
>
  Skip to main content
</Box>
```

#### Keyboard Event Handling
```typescript
// ✅ CORRECT: Keyboard event handling
<Card
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }}
  sx={{
    cursor: 'pointer',
    '&:focus': {
      outline: '2px solid',
      outlineColor: 'primary.main',
    },
  }}
>
  <CardContent>
    Keyboard accessible card
  </CardContent>
</Card>

// Custom dropdown with keyboard navigation
<Box
  role="combobox"
  aria-expanded={open}
  aria-haspopup="listbox"
  onKeyDown={(event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        // Move to next option
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Move to previous option
        break;
      case 'Enter':
        event.preventDefault();
        // Select current option
        break;
      case 'Escape':
        // Close dropdown
        break;
    }
  }}
>
  {/* Dropdown content */}
</Box>
```

### Screen Reader Optimization

#### Live Regions
```typescript
// ✅ CORRECT: Live regions for dynamic content
<Box
  role="status"
  aria-live="polite"
  aria-atomic="true"
  sx={{
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  }}
>
  {statusMessage}
</Box>

// Form validation announcements
<Box
  role="alert"
  aria-live="assertive"
  sx={{ display: errors.length > 0 ? 'block' : 'none' }}
>
  {errors.map((error, index) => (
    <Typography key={index} variant="bodySmall" color="error">
      {error}
    </Typography>
  ))}
</Box>

// Progress announcements
<Box
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Upload progress: ${progress}% complete`}
>
  <LinearProgress variant="determinate" value={progress} />
</Box>
```

#### Descriptive Text
```typescript
// ✅ CORRECT: Descriptive text for screen readers
<IconButton
  aria-label="Add song to favorites playlist"
  aria-describedby="favorite-description"
>
  <Favorite />
</IconButton>
<Typography
  id="favorite-description"
  sx={{ display: 'none' }}
>
  Click to add this song to your favorites playlist
</Typography>

// Image descriptions
<CardMedia
  component="img"
  image="/album-cover.jpg"
  alt="Album cover for 'Dark Side of the Moon' by Pink Floyd, featuring a prism dispersing white light into a rainbow spectrum"
  sx={{ height: 200 }}
/>

// Data visualization descriptions
<Box
  role="img"
  aria-label="Bar chart showing music listening by genre: Electronic 45%, Rock 30%, Jazz 15%, Classical 10%"
>
  {/* Chart component */}
</Box>
```

---

## Internationalization

### Text Handling

#### RTL Support
```typescript
// ✅ CORRECT: RTL-aware layout
<Box
  sx={{
    direction: 'rtl', // or use theme direction
    textAlign: 'start', // Use 'start' instead of 'left'
  }}
>
  <Typography variant="bodyMedium">
    النص العربي يظهر من اليمين إلى اليسار
  </Typography>
</Box>

// Icon positioning for RTL
<Button
  startIcon={<ArrowForward sx={{ transform: 'scaleX(-1)' }} />} // Flip for RTL
  sx={{
    '&[dir="rtl"]': {
      '& .MuiButton-startIcon': {
        marginLeft: 1,
        marginRight: -0.5,
      },
    },
  }}
>
  Next
</Button>
```

#### Text Expansion
```typescript
// ✅ CORRECT: Flexible layouts for text expansion
<Button
  sx={{
    minWidth: 120, // Allow for text expansion
    padding: '8px 16px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
>
  {t('button.save')} {/* Use translation keys */}
</Button>

// Responsive text sizing
<Typography
  variant="bodyMedium"
  sx={{
    fontSize: { xs: '14px', sm: '16px' }, // Adjust for different languages
    lineHeight: 1.5, // Accommodate diacritics and descenders
  }}
>
  {t('content.description')}
</Typography>
```

#### Number and Date Formatting
```typescript
// ✅ CORRECT: Locale-aware formatting
<Typography variant="bodyMedium">
  {new Intl.NumberFormat(locale).format(1234567)} plays
</Typography>

<Typography variant="bodySmall" color="text.secondary">
  {new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())}
</Typography>

// Currency formatting
<Typography variant="titleMedium">
  {new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(9.99)}
</Typography>
```

---

## Implementation Checklist

### Content Design
- [ ] Use clear, action-oriented button labels
- [ ] Write helpful error messages with solutions
- [ ] Provide informative loading and empty states
- [ ] Use consistent terminology throughout the app
- [ ] Follow the Material Design 3 typography hierarchy

### Accessibility
- [ ] Ensure 4.5:1 color contrast for normal text
- [ ] Provide visible focus indicators for all interactive elements
- [ ] Use minimum 44px touch targets (48px recommended)
- [ ] Add proper ARIA labels and roles
- [ ] Test keyboard navigation flow

### Screen Reader Support
- [ ] Use semantic HTML elements
- [ ] Provide alternative text for images
- [ ] Implement live regions for dynamic content
- [ ] Add descriptive labels for complex interactions
- [ ] Test with actual screen reader software

### Internationalization
- [ ] Use flexible layouts that accommodate text expansion
- [ ] Support RTL languages with proper icon and layout adjustments
- [ ] Use locale-aware number and date formatting
- [ ] Test with longer text strings in different languages
- [ ] Implement proper font loading for international characters

---

## Common Pitfalls

### ❌ Don't Do
- Use vague button labels like "OK" or "Submit"
- Write error messages without explaining how to fix the issue
- Rely only on color to convey information
- Use placeholder text as labels
- Ignore keyboard navigation patterns
- Hard-code text strings instead of using translation keys

### ✅ Do
- Write clear, specific button labels that describe the action
- Provide helpful error messages with actionable solutions
- Use multiple indicators (color, icons, text) for important information
- Use proper labels with helper text for form fields
- Test all functionality with keyboard-only navigation
- Design flexible layouts that work with different text lengths

---

## Official Resources

- [Material Design 3 Content Design](https://m3.material.io/foundations/content-design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Accessibility](https://m3.material.io/foundations/accessibility)
- [UX Writing Guidelines](https://m3.material.io/foundations/content-design/style-guide)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
