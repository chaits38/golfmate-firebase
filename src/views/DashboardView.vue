<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import StatCard  from '@/components/StatCard.vue'
import { useAuthStore } from '@/stores/auth'
import { getRoundHistory } from '@/services/db'
import { getMyStats }      from '@/services/stats'
import type { Round } from '@/types'
import type { PlayerStats } from '@/types'

const authStore = useAuthStore()
const stats     = ref<PlayerStats | null>(null)
const rounds    = ref<Round[]>([])
const loading   = ref(true)

function fmtDate(ts: any): string {
  return ts.toDate().toISOString().split('T')[0]
}

function vsPar(score: number, par: number): string {
  const d = score - par
  return d === 0 ? 'E' : d > 0 ? `+${d}` : `${d}`
}

function vsParColor(score: number, par: number): string {
  return score <= par ? 'var(--green)' : 'var(--red)'
}

const recentRounds = computed(() => rounds.value.slice(0, 5))

onMounted(async () => {
  const uid = authStore.user!.uid
  const [s, r] = await Promise.all([getMyStats(uid), getRoundHistory(uid)])
  stats.value  = s
  rounds.value = r
  loading.value = false
})
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>Welcome back, {{ authStore.profile?.name ?? authStore.user?.email }}!</h1>
    </div>

    <!-- Stat summary -->
    <div class="stat-grid">
      <template v-if="stats">
        <StatCard :value="stats.totalRounds"    label="Rounds Played" />
        <StatCard :value="stats.avgScore"       label="Avg Score" />
        <StatCard :value="stats.bestRound"       label="Best Round" />
        <StatCard :value="stats.handicap ?? '—'" label="Handicap Est." />
      </template>
      <template v-else-if="!loading">
        <StatCard value="—" label="Rounds Played" />
        <StatCard value="—" label="Avg Score" />
        <StatCard value="—" label="Best Round" />
        <StatCard value="—" label="Handicap Est." />
      </template>
    </div>

    <!-- Quick actions -->
    <div class="quick-actions">
      <RouterLink to="/new-round" class="btn">+ Record New Round</RouterLink>
      <RouterLink to="/courses"   class="btn btn-outline">Browse Courses</RouterLink>
    </div>

    <!-- Recent rounds -->
    <div class="card">
      <h2>Recent Rounds</h2>

      <div v-if="loading" class="loader">
        <span class="loader-icon">⛳</span>Loading…
      </div>

      <div v-else-if="recentRounds.length === 0" class="empty-state">
        <div class="icon">🏌️</div>
        <h3>No rounds yet</h3>
        <p><RouterLink to="/new-round">Record your first round!</RouterLink></p>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Score</th>
              <th>vs Par</th>
              <th>Putts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in recentRounds" :key="r.id">
              <td>{{ fmtDate(r.datePlayed) }}</td>
              <td>{{ r.courseName }}</td>
              <td><strong>{{ r.totalScore }}</strong></td>
              <td :style="{ color: vsParColor(r.totalScore, r.par ?? 72), fontWeight: 600 }">
                {{ vsPar(r.totalScore, r.par ?? 72) }}
              </td>
              <td>{{ r.totalPutts }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
