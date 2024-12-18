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
          disable
        />
        <q-select
          v-model="selectedSeason"
          :options="seasonOptions"
          label="Select Season"
          outlined
          dense
          style="width: 130px"
          disable
        />
        <q-input v-model="athleteName" label="Search Athlete" outlined dense disable />
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

const selectedDiscipline = ref({ label: 'Snowboard', value: 'SB' }) // Default: Snowboard
const selectedSeason = ref('2024') // Default: 2024 season
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

// Fetch sanctions dynamically
/*
const loadSanctions = async () => {
  const discipline = selectedDiscipline.value
  console.log('discipline', discipline)

  const season = selectedSeason.value

  errorMessage.value = ''
  loading.value = true

  try {
    sanctions.value = await fetchSanctions(discipline.value, season)

    if (!sanctions.value.length) {
      errorMessage.value = 'No results found for the selected filters.'
    }
  } catch (errorMessage) {
    errorMessage.value = 'An error occurred while fetching sanctions.'
  } finally {
    loading.value = false
  }
}*/

// Load latest sanctions on page load
onMounted(async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    sanctions.value = await fetchSanctions()

    if (!sanctions.value.length) {
      errorMessage.value = 'No sanctions available.'
    }
  } catch (errorMessage) {
    errorMessage.value = 'Failed to load sanctions. Please try again later.'
  } finally {
    loading.value = false
  }
})

const pagination = ref({
  page: 1,
  rowsPerPage: 20, // Show 20 records per page
})
</script>
