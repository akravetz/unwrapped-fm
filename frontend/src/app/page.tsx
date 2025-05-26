import { AppRouter } from '@/shared/components/AppRouter'
import { MusicAnalysisApp } from '@/domains/music-analysis'

export default function Home() {
  return (
    <AppRouter>
      <MusicAnalysisApp />
    </AppRouter>
  )
}
