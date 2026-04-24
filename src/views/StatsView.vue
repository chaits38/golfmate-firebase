<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import StatCard  from '@/components/StatCard.vue'
import { useAuthStore } from '@/stores/auth'
import { getMyStats }   from '@/services/stats'
import type { PlayerStats } from '@/types'

const authStore = useAuthStore()
const stats     = ref<PlayerStats | null>(null)
const loading   = ref(true)

const avgVsParStr = computed(() => {
  if (!stats.value) return '—'
  const v = stats.value.avgVsPar
  return v === 0 ? 'E' : v > 0 ? `+${v}` : `${v}`
})

onMounted(async () => {
  stats.value  = await getMyStats(authStore.user!.uid)
  loading.value = false
})
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>My Detailed Statistics</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loader">
      <span class="loader-icon">⛳</span>Loading stats…
    </div>

    <!-- No data -->
    <div v-else-if="!stats" class="card">
      <div class="empty-state">
        <div class="icon">📊</div>
        <h3>No data yet</h3>
        <p><RouterLink to="/new-round">Record your first round</RouterLink> to see stats here.</p>
      </div>
    </div>

    <!-- Stats content -->
    <template v-else>

      <!-- Scoring averages -->
      <div class="card">
        <h2>Scoring Averages</h2>
        <div class="stat-grid">
          <StatCard :value="stats.avgScore"       label="Avg Score" />
          <StatCard :value="stats.bestRound"       label="Best Round" />
          <StatCard :value="avgVsParStr"           label="Avg vs Par" />
          <StatCard :value="stats.handicap ?? '—'" label="Handicap Est." />
        </div>
      </div>

      <!-- Accuracy & penalties -->
      <div class="card">
        <h2>Accuracy &amp; Penalties</h2>
        <div class="stat-grid">
          <StatCard :value="stats.avgPutts"                        label="Avg Putts / Round" />
          <StatCard :value="`${stats.fairwaysHitPercent}%`"        label="Fairways Hit %" />
          <StatCard :value="`${stats.girPercent}%`"                label="GIR %" />
          <StatCard :value="stats.avgPenalties"                    label="Avg Penalties" />
        </div>
      </div>

      <!-- Trend table -->
      <div class="card">
        <h2>Score Trend — Last 10 Rounds</h2>
        <div v-if="!stats.trend?.length" style="color:var(--text-muted)">
          Not enough rounds to show a trend yet.
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, i) in stats.trend" :key="t.datePlayed + i">
                <td style="color:var(--text-muted)">{{ i + 1 }}</td>
                <td>{{ t.datePlayed }}</td>
                <td><strong>{{ t.totalScore }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </AppLayout>
</template>
