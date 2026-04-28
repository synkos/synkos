import { computed, type Ref, type ComputedRef } from 'vue';

export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrength {
  level: StrengthLevel;
  pct: number;
}

export function usePasswordStrength(
  password: Ref<string> | ComputedRef<string>
): ComputedRef<PasswordStrength> {
  return computed(() => {
    const p = password.value;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { level: 'weak', pct: 25 };
    if (score <= 2) return { level: 'fair', pct: 50 };
    if (score <= 3) return { level: 'good', pct: 75 };
    return { level: 'strong', pct: 100 };
  });
}
