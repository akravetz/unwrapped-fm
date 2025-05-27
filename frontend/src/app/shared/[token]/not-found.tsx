import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button
} from '@mui/material'
import Link from 'next/link'
import { COPY } from '@/lib/constants/copy'

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card elevation={0} sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Typography variant="h3" component="h1" color="primary">
                {COPY.APP_NAME}
              </Typography>

              <Typography variant="h5" gutterBottom>
                Analysis Not Found
              </Typography>

              <Typography variant="body1" color="text.secondary">
                This shared music analysis could not be found. The link may be invalid or the analysis may have been removed.
              </Typography>

              <Box sx={{ width: '100%', mt: 3 }}>
                <Button
                  component={Link}
                  href="/"
                  fullWidth
                  size="large"
                  variant="contained"
                >
                  Analyze Your Music
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Create your own music taste analysis and share it with friends.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
