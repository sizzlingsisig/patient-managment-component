<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <!-- Toolbar -->
    <div class="flex flex-wrap justify-between items-center mb-6 border-b pb-3 gap-4">
      <h2 class="text-lg font-semibold text-gray-800">Patient & Medical Records</h2>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Search Box -->
        <div class="relative w-52">
          <InputText
            v-model="rawSearch"
            @input="updateSearch"
            placeholder="Search..."
            class="w-full text-sm h-9 pr-8 pl-3"
          />

          <button
            v-if="rawSearch"
            @click="
              () => {
                rawSearch.value = '';
                searchTerm.value = '';
              }
            "
            aria-label="Clear search"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <!-- Global Date Filter -->
        <div class="flex items-center gap-2 text-sm">
          <!-- Replace input type="date" with PrimeVue Calendar -->
          <Calendar
            v-model="globalDateFilter.from"
            placeholder="From"
            showIcon
            dateFormat="yy-mm-dd"
            inputClass="text-sm px-2 py-1"
            class="w-36"
          />
          <Calendar
            v-model="globalDateFilter.to"
            placeholder="To"
            showIcon
            dateFormat="yy-mm-dd"
            inputClass="text-sm px-2 py-1"
            class="w-36"
          />

          <Button
            icon="pi pi-filter-slash"
            label="Clear"
            class="bg-gray-100 text-gray-700 border-none shadow-none px-3"
            @click="clearGlobalFilter"
          />
        </div>
      </div>
    </div>

    <!-- Accordion Tabs -->
    <Accordion v-model:activeIndex="activeIndex" :multiple="false">
      <AccordionPanel
        v-for="(patient, index) in paginatedPatients"
        :key="patient.patientID"
        :value="index.toString()"
      >
        <AccordionHeader>
          <div class="flex justify-between items-center w-full">
            <div class="flex flex-col">
              <span class="font-bold text-gray-800 hover:text-gray-600 cursor-pointer">{{
                patient.name
              }}</span>
              <span class="text-xs text-gray-400">ID: {{ patient.patientID }}</span>
              <span class="text-xs text-gray-400">Last Visit: {{ patient.lastVisit }}</span>
            </div>
            <div class="flex flex-wrap items-start gap-2">
              <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                >{{ getFilteredAndSortedCards(patient).length }} Consultations</span
              >
              <span
                :class="[
                  'text-xs px-2 py-0.5 rounded-full mr-5',
                  patient.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600',
                ]"
                >{{ patient.isActive ? 'Active Treatment' : 'Inactive Treatment' }}</span
              >
            </div>
          </div>
        </AccordionHeader>

        <AccordionContent>
          <div class="flex flex-col lg:flex-row gap-4 min-h-[420px]">
            <!-- Consultation Cards -->
            <div
              class="lg:w-3/4 w-full border border-gray-300 rounded-lg p-4 flex flex-col justify-between"
            >
              <div class="space-y-4">
                <h3 class="text-base font-semibold text-gray-800">Consultation History</h3>
                <template v-if="getFilteredAndSortedCards(patient).length">
                  <div
                    v-for="(card, i) in getPaginatedFilteredCards(patient, index)"
                    :key="i"
                    class="p-4 bg-white shadow rounded-lg cursor-pointer hover:shadow-md transition"
                    @click="selectCard(index, i)"
                    :class="{ 'ring-2 ring-blue-400': selectedCardIndices[index] === i }"
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="text-sm font-bold text-gray-800">
                          {{ card.consultationId || 'N/A' }} · {{ card.title }}
                        </p>
                        <p class="text-xs text-gray-500 mt-0.5">
                          Chief Complaint: {{ card.complaint }}
                        </p>
                        <p class="text-xs text-gray-400">Dr. {{ card.doctor }}</p>
                      </div>
                      <a href="#" class="text-xs text-blue-600 hover:underline" @click.stop
                        >View Consult</a
                      >
                    </div>
                  </div>
                </template>
                <p v-else class="text-sm text-gray-500">
                  No consultations within selected date range.
                </p>
              </div>

              <!-- Pagination & Sorting -->
              <div
                class="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-4 gap-3"
              >
                <!-- Pagination Controls -->
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <Button
                    icon="pi pi-angle-left"
                    label="Prev"
                    class="p-1 px-3 text-xs"
                    severity="secondary"
                    outlined
                    :disabled="consultationPages[patient.patientID] === 1"
                    @click="goToPreviousConsultationPage(patient.patientID)"
                  />
                  <span class="text-xs text-gray-500">
                    Page {{ consultationPages[patient.patientID] || 1 }} of
                    {{ getTotalConsultationPages(patient) }}
                  </span>
                  <Button
                    icon="pi pi-angle-right"
                    label="Next"
                    class="p-1 px-3 text-xs"
                    severity="secondary"
                    outlined
                    :disabled="
                      consultationPages[patient.patientID] === getTotalConsultationPages(patient)
                    "
                    @click="
                      goToNextConsultationPage(
                        patient.patientID,
                        getTotalConsultationPages(patient),
                      )
                    "
                  />
                </div>

                <!-- Sort Toggle -->
                <Button
                  @click="toggleSortOrder"
                  icon="pi pi-sort-alt"
                  class="text-xs px-3 py-1 bg-gray-100 text-gray-700 border-none hover:bg-gray-200"
                  :label="sortDescending ? 'Newest First' : 'Oldest First'"
                />
              </div>
            </div>

            <!-- Detail Panel -->
            <div
              class="lg:w-1/4 w-full p-4 shadow-inner rounded-lg flex flex-col justify-between border border-gray-200"
            >
              <div>
                <div class="flex justify-between items-start mb-4">
                  <h4 class="text-sm font-bold text-gray-800">
                    {{ getSelectedCard(index)?.consultationId || 'Select a card' }}
                  </h4>
                  <span
                    v-if="getSelectedCard(index)?.status"
                    :class="[
                      'text-xs px-2 py-0.5 rounded-full',
                      getSelectedCard(index).status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700',
                    ]"
                    >{{ getSelectedCard(index).status }}</span
                  >
                </div>
                <div
                  v-if="getSelectedCard(index)"
                  class="space-y-4 text-sm text-gray-700 overflow-y-auto max-h-[320px] pr-2"
                >
                  <div
                    v-for="label in [
                      'diagnosis',
                      'medications',
                      'allergies',
                      'appointment',
                      'payment',
                    ]"
                    :key="label"
                  >
                    <p class="font-semibold text-gray-600">
                      {{
                        label
                          .replace(/^./, (m) => m.toUpperCase())
                          .replace('appointment', 'Next Appointment')
                          .replace('payment', 'Total Payment')
                          .replace('medications', 'Active Medications')
                          .replace('diagnosis', 'Current Diagnosis')
                      }}
                    </p>
                    <p>{{ getSelectedCard(index)[label] || 'N/A' }}</p>
                  </div>
                </div>
                <p v-else class="text-gray-500 text-sm">Click a card to view details.</p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-6">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
      >
        Previous
      </button>
      <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import patientsData from '@/patientData.json';
import { useDebounceFn } from '@vueuse/core';
const pageSize = 3;
const consultationPageSize = 3;

const patients = ref(patientsData);

const rawSearch = ref('');
const searchTerm = ref('');
const activeIndex = ref('0');
const selectedCardIndices = ref({});
const globalDateFilter = ref({ from: '', to: '' });
const consultationPages = ref({});
const sortDescending = ref(true);
const currentPage = ref(1);

// Memoize parsed dates
const dateRange = computed(() => ({
  from: globalDateFilter.value.from ? new Date(globalDateFilter.value.from) : null,
  to: globalDateFilter.value.to ? new Date(globalDateFilter.value.to) : null,
}));

const updateSearch = useDebounceFn(() => {
  searchTerm.value = rawSearch.value;
}, 300);
const paginatedPatients = computed(() => {
  const term = searchTerm.value.toLowerCase();
  const filtered = term
    ? patients.value.filter((p) => p.name.toLowerCase().includes(term))
    : patients.value;

  const start = (currentPage.value - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
});

const totalPages = computed(() => {
  const term = searchTerm.value.toLowerCase();
  const filtered = term
    ? patients.value.filter((p) => p.name.toLowerCase().includes(term))
    : patients.value;

  return Math.ceil(filtered.length / pageSize);
});

// Cache for expensive operations
const cardCache = new Map();

function getFilteredAndSortedCards(patient) {
  const key = `${patient.patientID}_${dateRange.value.from?.getTime()}_${dateRange.value.to?.getTime()}_${sortDescending.value}`;

  if (cardCache.has(key)) return cardCache.get(key);

  let cards = patient.cards || [];
  const { from, to } = dateRange.value;

  if (from || to) {
    cards = cards.filter((card) => {
      const date = new Date(card.date);
      return (!from || date >= from) && (!to || date <= to);
    });
  }

  const sorted = [...cards].sort((a, b) => {
    const diff = new Date(b.date) - new Date(a.date);
    return sortDescending.value ? diff : -diff;
  });

  cardCache.set(key, sorted);
  return sorted;
}

function getPaginatedFilteredCards(patient) {
  const id = patient.patientID;
  consultationPages.value[id] ??= 1;

  const allCards = getFilteredAndSortedCards(patient);
  const start = (consultationPages.value[id] - 1) * consultationPageSize;
  return allCards.slice(start, start + consultationPageSize);
}

function getTotalConsultationPages(patient) {
  return Math.max(1, Math.ceil(getFilteredAndSortedCards(patient).length / consultationPageSize));
}

function goToPreviousConsultationPage(patientID) {
  consultationPages.value[patientID] = Math.max(1, (consultationPages.value[patientID] || 1) - 1);
}

function goToNextConsultationPage(patientID, totalPages) {
  consultationPages.value[patientID] = Math.min(
    totalPages,
    (consultationPages.value[patientID] || 1) + 1,
  );
}

function selectCard(patientIndex, cardIndex) {
  const patient = paginatedPatients.value[patientIndex];
  if (patient) selectedCardIndices.value[patient.patientID] = cardIndex;
}

function getSelectedCard(patientIndex) {
  const patient = paginatedPatients.value[patientIndex];
  if (!patient) return null;

  const cards = getFilteredAndSortedCards(patient);
  const cardIndex = selectedCardIndices.value[patient.patientID];
  return cards?.[cardIndex] || null;
}

function clearGlobalFilter() {
  globalDateFilter.value = { from: '', to: '' };
}

function toggleSortOrder() {
  sortDescending.value = !sortDescending.value;
}

// Clear cache and reset on filter changes
watch([globalDateFilter, sortDescending], () => cardCache.clear(), { deep: true });

watch(
  [globalDateFilter, searchTerm],
  () => {
    consultationPages.value = {};
    selectedCardIndices.value = {};
    currentPage.value = 1;
    cardCache.clear();
  },
  { deep: true },
);
</script>
