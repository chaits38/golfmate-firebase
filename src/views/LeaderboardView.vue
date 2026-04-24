<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore }       from '@/stores/auth'
import { getLeaderboardData } from '@/services/db'
import type { LeaderboardEntry } from '@/types'

const authStore = useAuthStore()
const players   = ref<LeaderboardEntry[]>([])
const loading   = ref(true)

const MEDALS = ['🥇', '🥈', '🥉']

function medal(i: number): string {
  return MEDALS[i] ?? `#${i + 1}`
}

function hcapStr(h: number): string {
  return h > 0 ? `+${h}` : `${h}`
}

function rowClass(i: number, uid: string): string {
  if (uid === authStore.user?.uid) return 'you-row'
  if (i < 3) return `rank-${i + 1}`
  return ''
}

onMounted(async () => {
  players.value  = await getLeaderboardData()
  loading.value  = false
})
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>🏆 Leaderboard</h1>
    </div>

    <div class="card">
      <h2>Global Rankings — Best Average Score</h2>

      <div v-if="loading" class="loader">
        <span class="loader-icon">⛳</span>Loading rankings…
      </div>

      <div v-else-if="players.length === 0" class="empty-state">
        <div class="icon">🏌️</div>
        <h3>No rounds recorded yet</h3>
        <p>Be the first — <RouterLink to="/new-round">record a round!</RouterLink></p>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:60px">Rank</th>
              <th>Player</th>
              <th>Rounds</th>
              <th>Best Round</th>
              <th>Avg Score</th>
              <th>Handicap Est.</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(p, i) in players"
              :key="p.uid"
              :class="rowClass(i, p.uid)"
            >
              <td style="text-align:center; font-size:1.2rem">{{ medal(i) }}</td>
              <td>
                {{ p.name }}
                <span
                  v-if="p.uid === authStore.user?.uid"
                  style="color:var(--green); font-size:12px; margin-left:6px"
                >(You)</span>
              </td>
              <td>{{ p.totalRounds }}</td>
              <td>{{ p.bestRound }}</td>
              <td><strong>{{ p.avgScore }}</strong></td>
              <td>{{ hcapStr(p.handicap) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
