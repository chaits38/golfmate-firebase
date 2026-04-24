<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { getRoundHistory, getRound, deleteRound } from '@/services/db'
import type { Round, RoundWithHoles } from '@/types'

const authStore   = useAuthStore()
const rounds      = ref<Round[]>([])
const loading     = ref(true)
// Use a plain reactive object instead of Set — Vue tracks object keys reliably
const expanded    = ref<Record<string, boolean>>({})
const holeCache   = ref<Record<string, RoundWithHoles>>({})
const holeLoading = ref<Record<string, boolean>>({})

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

onMounted(async () => {
  rounds.value  = await getRoundHistory(authStore.user!.uid)
  loading.value = false
})

async function toggleDetail(roundId: string) {
  if (expanded.value[roundId]) {
    expanded.value[roundId] = false
    return
  }
  expanded.value[roundId] = true
  if (!holeCache.value[roundId]) {
    holeLoading.value[roundId] = true
    const data = await getRound(roundId)
    if (data) holeCache.value[roundId] = data
    holeLoading.value[roundId] = false
  }
}

async function removeRound(roundId: string) {
  if (!confirm('Delete this round? This cannot be undone.')) return
  await deleteRound(roundId)
  rounds.value = rounds.value.filter(r => r.id !== roundId)
  delete expanded.value[roundId]
}
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>Round History</h1>
      <RouterLink to="/new-round" class="btn">+ New Round</RouterLink>
    </div>

    <div class="card" style="padding:0; overflow:hidden">
      <div v-if="loading" class="loader">
        <span class="loader-icon">⛳</span>Loading…
      </div>

      <div v-else-if="rounds.length === 0" class="empty-state">
        <div class="icon">🏌️</div>
        <h3>No rounds recorded yet</h3>
        <p><RouterLink to="/new-round">Record your first round!</RouterLink></p>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:36px"></th>
              <th>Date</th>
              <th>Course</th>
              <th>Score</th>
              <th>vs Par</th>
              <th>Putts</th>
              <th>Penalties</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="r in rounds" :key="r.id">
              <tr>
                <td>
                  <button class="expand-btn" @click="toggleDetail(r.id)">
                    {{ expanded[r.id] ? '▼' : '▶' }}
                  </button>
                </td>
                <td>{{ fmtDate(r.datePlayed) }}</td>
                <td>{{ r.courseName }}</td>
                <td><strong>{{ r.totalScore }}</strong></td>
                <td :style="{ color: vsParColor(r.totalScore, r.par ?? 72), fontWeight: 600 }">
                  {{ vsPar(r.totalScore, r.par ?? 72) }}
                </td>
                <td>{{ r.totalPutts }}</td>
                <td>{{ r.penalties ?? 0 }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="removeRound(r.id)">
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="expanded[r.id]" class="detail-row">
                <td colspan="8">
                  <div class="detail-inner">
                    <div v-if="holeLoading[r.id]" style="color:#888">Loading holes…</div>
                    <div v-else-if="!holeCache[r.id]?.holes?.length">
                      <em>No hole data found.</em>
                    </div>
                    <template v-else>
                      <strong>Hole-by-Hole Scorecard</strong>
                      <table class="hole-mini">
                        <thead>
                          <tr>
                            <th>Hole</th><th>Strokes</th><th>Putts</th><th>Fairway</th><th>GIR</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="h in holeCache[r.id].holes" :key="h.holeNumber">
                            <td>{{ h.holeNumber }}</td>
                            <td><strong>{{ h.strokes }}</strong></td>
                            <td>{{ h.putts }}</td>
                            <td>{{ h.fairwayHit        ? '✅' : '—' }}</td>
                            <td>{{ h.greenInRegulation ? '✅' : '—' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
