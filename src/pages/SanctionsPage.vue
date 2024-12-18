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
        <q-input v-model="athleteName" label="Search Athlete" outlined dense /><q-btn
          label="Filter"
          color="primary"
          @click="applyFilters"
        />
      </div>

      <!-- Loading Spinner -->
      <q-spinner v-if="loading" color="primary" size="3em" />

      <!-- Error Message -->
      <q-banner v-if="errorMessage" class="bg-red text-white q-mb-md">
        {{ errorMessage }}
      </q-banner>

      <!-- Data Table -->
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

const selectedDiscipline = ref() // Default: Snowboard
const selectedSeason = ref() // Default: 2024 season
const athleteName = ref('')

// Options for dropdowns
const disciplineOptions = [
  { label: 'Snowboard', value: 'SB' },
  { label: 'Cross-Country', value: 'CC' },
  { label: 'Freestyle Skiing', value: 'FS' },
  { label: 'Nordic Combined', value: 'NK' },
]
const seasonOptions = ['2022', '2023', '2024']

// Columns for table
const columns = [
  {
    name: 'athlete',
    label: 'Athlete',
    align: 'left',
    field: (row) => `${row.firstName} ${row.lastName} (${row.athlete?.nationCode || 'N/A'})`,
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

const loadSanctions = async (filters = {}) => {
  loading.value = true
  errorMessage.value = ''

  try {
    sanctions.value = await fetchSanctions(filters)
  } catch (errorMessage) {
    errorMessage.value = 'Failed to load sanctions. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Load latest sanctions on page load
onMounted(() => {
  loadSanctions() // Load 20 latest sanctions without filters
})

// Apply filters dynamically
const applyFilters = () => {
  const filterDiscipline = selectedDiscipline.value ? selectedDiscipline.value : null
  const filters = {
    discipline: filterDiscipline.value,
    season: selectedSeason.value,
    athleteName: athleteName.value.trim(),
  }

  loadSanctions(filters)
}

const pagination = ref({
  page: 1,
  rowsPerPage: 20, // Show 20 records per page
})
</script>
