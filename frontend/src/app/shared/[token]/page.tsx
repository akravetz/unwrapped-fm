import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publicApiClient } from '@/lib/api/publicApiClient'
import { SharedResultsScreen } from '@/domains/results-sharing/components/SharedResultsScreen'
import { ThemeRegistry } from '@/domains/ui-foundation/theme/ThemeRegistry'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { token } = await params
    const result = await publicApiClient.getSharedAnalysis(token)

    return {
      title: `${result.rating_text} - Unwrapped.fm Music Analysis`,
      description: `Check out this music taste analysis: "${result.rating_description.slice(0, 150)}..."`,
      openGraph: {
        title: `${result.rating_text} - Music Analysis`,
        description: result.rating_description.slice(0, 200),
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${result.rating_text} - Music Analysis`,
        description: result.rating_description.slice(0, 200),
      },
    }
  } catch {
    return {
      title: 'Shared Music Analysis - Unwrapped.fm',
      description: 'View a shared music taste analysis from Unwrapped.fm',
    }
  }
}

export default async function SharedAnalysisPage({ params }: PageProps) {
  try {
    const { token } = await params
    const result = await publicApiClient.getSharedAnalysis(token)

    return (
      <ThemeRegistry>
        <ErrorBoundary>
          <SharedResultsScreen result={result} />
        </ErrorBoundary>
      </ThemeRegistry>
    )
  } catch (error) {

    console.error('Failed to load shared analysis:', error)// If the analysis is not found or there's an error, show 404

    notFound()
  }
}
