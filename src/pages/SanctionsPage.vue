<template>
  <q-page padding>
    <div class="q-pa-md">
      <h3 class="text-h5">FIS Sanctioned Athletes</h3>

      <!-- Filters -->
      <div class="q-mb-md row q-gutter-md">
        <q-select
          v-model="selectedDiscipline"
          :options="disciplineOptions"
          label="Select Discipline"
          outlined
          dense
          style="width: 160px"
        />
        <q-select
          v-model="selectedSeason"
          :options="seasonOptions"
          label="Select Season"
          outlined
          dense
          style="width: 150px"
        />
        <q-input v-model="athleteName" label="Search Athlete" outlined dense />
        <q-btn label="Search" color="primary" @click="applyFilters" />
        <q-btn label="Clear" color="primary" @click="clearFilters" />
      </div>

      <!-- Error Message -->
      <q-banner v-if="errorMessage" class="bg-red text-white q-mb-md">
        {{ errorMessage }}
      </q-banner>

      <!-- Data Table -->
      <q-spinner v-if="loading" color="primary" size="3em" />
      <q-table
        v-if="!loading && sanctions.length"
        :rows="sanctions"
        :columns="columns"
        row-key="id"
        flat
        bordered
        v-model:pagination="pagination"
      />
      <div v-else-if="!loading" class="text-center text-grey">
        No sanctions available for the selected filters.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchSanctions } from 'src/api/fisApi'

// State
const sanctions = ref([])
const errorMessage = ref('')
const loading = ref(false)

const selectedDiscipline = ref()
const selectedSeason = ref() // Default: 2024 season
const athleteName = ref('')

// Options for dropdowns
const disciplineOptions = [
  { label: 'Snowboard', value: 'SB' },
  { label: 'Cross-Country', value: 'CC' },
  { label: 'Freestyle Skiing', value: 'FS' },
  { label: 'Nordic Combined', value: 'NK' },
]
const seasonOptions = ['2022', '2023', '2024', '2025']

// Columns for table
const columns = [
  {
    name: 'athlete',
    label: 'Athlete',
    align: 'left',
    field: (row) => `${row.firstName} ${row.lastName} (${row.athlete?.nationCode || 'N/A'})`,
  },
  {
    name: 'discipline',
    label: 'Discipline',
    align: 'center',
    field: (row) => row.competitionSummary?.disciplineCode || 'N/A',
  },
  {
    name: 'gender',
    label: 'Gender',
    align: 'center',
    field: (row) => row.competitionSummary?.genderCode || 'N/A',
  },
  {
    name: 'birthYear',
    label: 'BirthYear',
    align: 'center',
    field: (row) => row.athlete?.birthYear,
  },
  {
    name: 'fisCode',
    label: 'FIS Code',
    align: 'center',
    field: (row) => row.athlete?.fisCode || 'N/A',
  },
  {
    name: 'location',
    label: 'Location',
    align: 'left',
    field: (row) => `${row.competitionSummary.place}, ${row.competitionSummary.placeNationCode}`,
  },
  {
    name: 'date',
    label: 'Date',
    align: 'center',
    field: (row) => new Date(row.competitionSummary.date).toLocaleDateString(),
  },
  {
    name: 'category',
    label: 'Category',
    align: 'center',
    field: (row) => row.competitionSummary.categoryCode,
  },
  {
    name: 'violation',
    label: 'Violation',
    align: 'center',
    field: (row) => row.violations.map((v) => v.name).join(', '),
  },
  {
    name: 'sanction',
    label: 'Sanction',
    align: 'center',
    field: (row) => (row.resultsInRedCard ? 'Red Card' : 'Yellow Card'),
  },
]

const cachedSanctionsKey = 'sanctionsData' // Key for localStorage

const loadSanctions = async (filters = {}) => {
  loading.value = true
  errorMessage.value = ''

  const filtersKey = JSON.stringify(filters)

  // Check localStorage for cached data
  const cachedData = localStorage.getItem(`${cachedSanctionsKey}-${filtersKey}`)
  if (cachedData) {
    sanctions.value = JSON.parse(cachedData)
    loading.value = false
    return
  }
  console.log('cachedData', cachedData)

  try {
    sanctions.value = await fetchSanctions(filters)
    console.log('sanctions', sanctions.value)
    if (!sanctions.value.length) {
      errorMessage.value = 'No sanctions available for the selected filters.'
    } else {
      // Cache data in localStorage
      localStorage.setItem(`${cachedSanctionsKey}-${filtersKey}`, JSON.stringify(sanctions.value))
    }
  } catch (error) {
    if (error.message.includes('429')) {
      errorMessage.value = 'You are making too many requests. Please wait a moment and try again.'
    } else {
      errorMessage.value =
        'Network error: Unable to connect. Please check your internet connection and try again.'
    }
  } finally {
    loading.value = false
  }
}

// Load latest sanctions on page load
onMounted(() => {
  const filters = { discipline: 'SB,FS,CC,NK' } // Default load all disciplines
  loadSanctions(filters)
})

// Apply filters dynamically
const applyFilters = () => {
  const filters = {
    discipline: selectedDiscipline.value?.value || 'SB,FS,CC,NK', // Send all disciplines if none is selected
    season: selectedSeason.value,
    athleteName: athleteName.value.trim(),
  }
  console.log('Applying filters:', filters)
  loadSanctions(filters)
}

const clearFilters = () => {
  selectedDiscipline.value = null
  selectedSeason.value = null
  athleteName.value = ''
  loadSanctions({ discipline: 'SB,FS,CC,NK' }) // Reset to all disciplines
}

const pagination = ref({
  page: 1,
  rowsPerPage: 20, // Show 20 records per page
})
</script>
