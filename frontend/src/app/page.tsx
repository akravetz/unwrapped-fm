import { AppRouter } from '@/shared/components/AppRouter'
import { MusicAnalysisApp } from '@/domains/music-analysis'
import { DebugPanel } from '@/shared/components/DebugPanel'

export default function Home() {
  return (
    <AppRouter>
      <MusicAnalysisApp />
      <DebugPanel />
    </AppRouter>
  )
}
