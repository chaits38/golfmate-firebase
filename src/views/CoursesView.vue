<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { getCourses, addCourse, addFavorite, removeFavorite } from '@/services/db'
import type { Course, NewCourseData } from '@/types'

const authStore    = useAuthStore()
const allCourses   = ref<Course[]>([])
const userFavs     = ref<string[]>([])
const searchTerm   = ref('')
const loading      = ref(true)
const showModal    = ref(false)
const modalError   = ref('')
const addingCourse = ref(false)

const newCourse = ref<NewCourseData>({
  courseName: '', location: '', holes: 18, par: 72, yardage: 6500
})

const filtered = computed(() => {
  const term = searchTerm.value.toLowerCase()
  if (!term) return allCourses.value
  return allCourses.value.filter(c =>
    c.courseName.toLowerCase().includes(term) ||
    (c.location ?? '').toLowerCase().includes(term)
  )
})

onMounted(async () => {
  userFavs.value   = authStore.profile?.favorites ?? []
  allCourses.value = await getCourses()
  loading.value    = false
})

function isFav(courseId: string): boolean {
  return userFavs.value.includes(courseId)
}

async function toggleFav(courseId: string) {
  const uid = authStore.user!.uid
  if (isFav(courseId)) {
    await removeFavorite(uid, courseId)
    userFavs.value = userFavs.value.filter(id => id !== courseId)
  } else {
    await addFavorite(uid, courseId)
    userFavs.value = [...userFavs.value, courseId]
  }
  await authStore.refreshProfile()
}

function openModal() {
  newCourse.value  = { courseName: '', location: '', holes: 18, par: 72, yardage: 6500 }
  modalError.value = ''
  showModal.value  = true
}

async function submitCourse() {
  modalError.value = ''
  if (!newCourse.value.courseName.trim()) {
    modalError.value = 'Course name is required.'
    return
  }
  addingCourse.value = true
  try {
    const newId  = await addCourse({ ...newCourse.value, courseName: newCourse.value.courseName.trim() })
    const added: Course = { id: newId, ...newCourse.value }
    allCourses.value = [...allCourses.value, added]
    showModal.value  = false
  } catch (e: any) {
    modalError.value = 'Error: ' + e.message
  } finally {
    addingCourse.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="page-header">
      <h1>Course Database</h1>
      <button class="btn" @click="openModal">+ Add New Course</button>
    </div>

    <input
      v-model="searchTerm"
      type="text"
      placeholder="Search by course name or location…"
      style="margin-bottom:20px"
    >

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <h3>Add New Course</h3>
          <div v-if="modalError" class="alert alert-error">{{ modalError }}</div>

          <label>Course Name
            <input v-model="newCourse.courseName" type="text" placeholder="Pebble Beach Golf Links">
          </label>
          <label>Location
            <input v-model="newCourse.location" type="text" placeholder="Pebble Beach, CA">
          </label>
          <div class="form-row-3">
            <label>Holes   <input v-model.number="newCourse.holes"   type="number" min="9"    max="27"></label>
            <label>Par     <input v-model.number="newCourse.par"     type="number" min="60"   max="80"></label>
            <label>Yardage <input v-model.number="newCourse.yardage" type="number" min="3000" max="9000"></label>
          </div>

          <div class="modal-actions">
            <button class="btn btn-outline" @click="showModal = false">Cancel</button>
            <button class="btn" :disabled="addingCourse" @click="submitCourse">
              {{ addingCourse ? 'Adding…' : 'Add Course' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="loading" class="loader">
      <span class="loader-icon">⛳</span>Loading courses…
    </div>

    <div v-else class="card" style="padding:0; overflow:hidden">
      <div v-if="filtered.length === 0" class="empty-state">
        <div class="icon">⛳</div>
        <h3>No courses found</h3>
        <p>Try a different search or <button class="btn btn-sm" style="display:inline-flex" @click="openModal">add one</button>.</p>
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Location</th>
              <th>Holes</th>
              <th>Par</th>
              <th>Yardage</th>
              <th>Favorite</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.id">
              <td><strong>{{ c.courseName }}</strong></td>
              <td>{{ c.location || '—' }}</td>
              <td>{{ c.holes || 18 }}</td>
              <td>{{ c.par || '—' }}</td>
              <td>{{ c.yardage ? `${c.yardage} yds` : '—' }}</td>
              <td>
                <button
                  class="fav-btn"
                  :title="isFav(c.id) ? 'Remove favorite' : 'Add favorite'"
                  @click="toggleFav(c.id)"
                >{{ isFav(c.id) ? '★' : '☆' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
