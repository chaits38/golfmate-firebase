<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { getCourses, saveRound } from '@/services/db'
import type { Course, HoleInput } from '@/types'

const router    = useRouter()
const authStore = useAuthStore()

const NUM_HOLES = 18

const courses    = ref<Course[]>([])
const courseId   = ref('')
const datePlayed = ref('')
const penalties  = ref(0)
const saving     = ref(false)
const error      = ref('')

// ref array of objects — more predictable reactivity than reactive([])
const holes = ref<HoleInput[]>(
  Array.from({ length: NUM_HOLES }, (_, i) => ({
    holeNumber:        i + 1,
    strokes:           4,
    putts:             2,
    fairwayHit:        false,
    greenInRegulation: false
  }))
)

const selectedCourse = computed<Course | undefined>(() =>
  courses.value.find(c => c.id === courseId.value)
)

const totalScore = computed(() => holes.value.reduce((s, h) => s + (Number(h.strokes) || 0), 0))
const totalPutts = computed(() => holes.value.reduce((s, h) => s + (Number(h.putts)   || 0), 0))

const vsPar = computed(() => {
  const par = selectedCourse.value?.par ?? 72
  const d   = totalScore.value - par
  return d === 0 ? 'E' : d > 0 ? `+${d}` : `${d}`
})

const vsParColor = computed(() =>
  totalScore.value <= (selectedCourse.value?.par ?? 72) ? 'var(--green)' : 'var(--red)'
)

onMounted(async () => {
  courses.value    = await getCourses()
  datePlayed.value = new Date().toISOString().split('T')[0]
})

async function submit() {
  error.value = ''
  if (!courseId.value)   { error.value = 'Please select a course.'; return }
  if (!datePlayed.value) { error.value = 'Please select a date.';   return }

  saving.value = true
  try {
    await saveRound(
      authStore.user!.uid,
      { courseId: courseId.value, datePlayed: datePlayed.value, penalties: penalties.value },
      holes.value.map(h => ({
        ...h,
        strokes: Number(h.strokes),
        putts:   Number(h.putts)
      }))
    )
    router.push('/history')
  } catch (e: any) {
    error.value  = 'Error saving round: ' + e.message
    saving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <Teleport to="body">
      <div v-if="saving" class="saving-overlay">
        <div class="saving-box">
          <span class="icon">⛳</span>
          <p style="font-size:1.1rem; font-weight:600">Saving round…</p>
        </div>
      </div>
    </Teleport>

    <div class="page-header">
      <h1>Record New Round</h1>
    </div>

    <div class="card">
      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="form-row-3" style="margin-bottom:8px">
        <label>Course
          <select v-model="courseId">
            <option value="">— Select a course —</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">
              {{ c.courseName }} (par {{ c.par }})
            </option>
          </select>
        </label>
        <label>Date Played
          <input v-model="datePlayed" type="date">
        </label>
        <label>Penalties
          <input v-model.number="penalties" type="number" min="0" max="50">
        </label>
      </div>

      <div class="total-bar">
        <div>Score: <span>{{ totalScore }}</span></div>
        <div>Putts: <span>{{ totalPutts }}</span></div>
        <div style="font-size:.95rem">vs Par:
          <span :style="{ color: vsParColor }">{{ vsPar }}</span>
        </div>
      </div>

      <div class="table-wrap">
        <table id="scorecard-table">
          <thead>
            <tr>
              <th style="width:50px">Hole</th>
              <th>Strokes</th>
              <th>Putts</th>
              <th>Fairway Hit</th>
              <th>Green in Reg</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hole in holes" :key="hole.holeNumber">
              <td class="scorecard-cell" style="font-weight:700; color:var(--green)">
                {{ hole.holeNumber }}
              </td>
              <td class="scorecard-cell">
                <input v-model.number="hole.strokes" type="number" min="1" max="20" class="scorecard-input">
              </td>
              <td class="scorecard-cell">
                <input v-model.number="hole.putts" type="number" min="0" max="10" class="scorecard-input">
              </td>
              <td class="scorecard-cell">
                <input v-model="hole.fairwayHit"        type="checkbox" class="scorecard-check">
              </td>
              <td class="scorecard-cell">
                <input v-model="hole.greenInRegulation" type="checkbox" class="scorecard-check">
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top:20px; display:flex; gap:12px;">
        <button class="btn" :disabled="saving" @click="submit">Save Round</button>
        <RouterLink to="/dashboard" class="btn btn-outline">Cancel</RouterLink>
      </div>
    </div>
  </AppLayout>
</template>
