// composables/usePatientRecords.js
import { ref, computed, watch } from 'vue';

export function usePatientRecords(patientsData, pageSize = 3, consultationPageSize = 3) {
  const patients = ref(patientsData);
  const searchTerm = ref('');
  const activeIndex = ref('0');
  const selectedCardIndices = ref({});
  const globalDateFilter = ref({ from: '', to: '' });
  const consultationPages = ref({});
  const sortDescending = ref(true);

  const currentPage = ref(1);
  const totalPages = computed(() => Math.ceil(filteredPatients.value.length / pageSize));

  const filteredPatients = computed(() => {
    const term = searchTerm.value.toLowerCase();
    return term
      ? patients.value.filter((p) => p.name.toLowerCase().includes(term))
      : patients.value;
  });

  const paginatedPatients = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredPatients.value.slice(start, start + pageSize);
  });

  function selectCard(patientID, cardIndex) {
    selectedCardIndices.value[patientID] = cardIndex;
  }

  function getSelectedCard(patientID) {
    const patient = patients.value.find((p) => p.patientID === patientID);
    const cards = getFilteredAndSortedCards(patient);
    const cardIndex = selectedCardIndices.value[patientID];
    return cards?.[cardIndex] || null;
  }

  function clearGlobalFilter() {
    globalDateFilter.value = { from: '', to: '' };
  }

  function toggleSortOrder() {
    sortDescending.value = !sortDescending.value;
  }

  function getFilteredAndSortedCards(patient) {
    const from = globalDateFilter.value.from ? new Date(globalDateFilter.value.from) : null;
    const to = globalDateFilter.value.to ? new Date(globalDateFilter.value.to) : null;

    let cards = [...(patient.cards || [])];

    if (from || to) {
      cards = cards.filter((card) => {
        const date = new Date(card.date);
        return (!from || date >= from) && (!to || date <= to);
      });
    }

    return cards.sort((a, b) =>
      sortDescending.value
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date),
    );
  }

  function getPaginatedFilteredCards(patient) {
    const allCards = getFilteredAndSortedCards(patient);
    const currentConsultPage = consultationPages.value[patient.patientID] || 1;
    const start = (currentConsultPage - 1) * consultationPageSize;
    return allCards.slice(start, start + consultationPageSize);
  }

  function getTotalConsultationPages(patient) {
    const total = getFilteredAndSortedCards(patient).length;
    return Math.ceil(total / consultationPageSize) || 1;
  }

  watch([globalDateFilter, searchTerm], () => {
    consultationPages.value = {};
    selectedCardIndices.value = {};
    currentPage.value = 1;
  });

  return {
    // state
    patients,
    searchTerm,
    activeIndex,
    selectedCardIndices,
    globalDateFilter,
    currentPage,
    totalPages,
    sortDescending,
    consultationPages,

    // computed
    filteredPatients,
    paginatedPatients,

    // methods
    selectCard,
    getSelectedCard,
    clearGlobalFilter,
    toggleSortOrder,
    getPaginatedFilteredCards,
    getTotalConsultationPages,
    getFilteredAndSortedCards,
  };
}
