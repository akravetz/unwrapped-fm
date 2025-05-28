/**
 * Authentication guard utility to prevent infinite redirect loops
 */

interface AuthAttempt {
  timestamp: number
  url: string
  type: 'token' | 'callback'
}

class AuthGuard {
  private attempts: AuthAttempt[] = []
  private readonly MAX_ATTEMPTS = 3
  private readonly ATTEMPT_WINDOW = 30000 // 30 seconds
  private readonly COOLDOWN_PERIOD = 60000 // 1 minute

  private cleanOldAttempts(): void {
    const now = Date.now()
    this.attempts = this.attempts.filter(
      attempt => now - attempt.timestamp < this.ATTEMPT_WINDOW
    )
  }

  canAttemptAuth(url: string, type: 'token' | 'callback'): boolean {
    this.cleanOldAttempts()

    const recentAttempts = this.attempts.filter(attempt => attempt.type === type)

    if (recentAttempts.length >= this.MAX_ATTEMPTS) {
      console.warn(`[AuthGuard] Too many ${type} attempts, blocking for cooldown period`)
      return false
    }

    // Check for duplicate URL attempts (potential loop)
    const duplicateAttempts = this.attempts.filter(attempt => attempt.url === url)
    if (duplicateAttempts.length >= 2) {
      console.warn(`[AuthGuard] Duplicate URL attempts detected, potential loop: ${url}`)
      return false
    }

    return true
  }

  recordAttempt(url: string, type: 'token' | 'callback'): void {
    this.attempts.push({
      timestamp: Date.now(),
      url,
      type
    })

    console.log(`[AuthGuard] Recorded ${type} attempt:`, {
      url,
      totalAttempts: this.attempts.length,
      recentAttempts: this.attempts.filter(a => a.type === type).length
    })
  }

  isInCooldown(): boolean {
    this.cleanOldAttempts()
    return this.attempts.length >= this.MAX_ATTEMPTS
  }

  getCooldownTimeRemaining(): number {
    if (!this.isInCooldown()) return 0

    const oldestAttempt = Math.min(...this.attempts.map(a => a.timestamp))
    const cooldownEnd = oldestAttempt + this.COOLDOWN_PERIOD
    return Math.max(0, cooldownEnd - Date.now())
  }

  reset(): void {
    console.log('[AuthGuard] Resetting auth attempts')
    this.attempts = []
  }

  getDebugInfo(): object {
    this.cleanOldAttempts()
    return {
      attempts: this.attempts.length,
      isInCooldown: this.isInCooldown(),
      cooldownRemaining: this.getCooldownTimeRemaining(),
      recentAttempts: this.attempts.map(a => ({
        type: a.type,
        url: a.url,
        timeAgo: Date.now() - a.timestamp
      }))
    }
  }
}

export const authGuard = new AuthGuard()
