<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="h-20 px-6 py-4 flex items-center justify-between bg-white shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Patient Medical Records</h1>
        <p class="text-sm text-gray-500">
          Manage patient consultations, diagnosis, and treatment plans
        </p>
      </div>

      <Button
        label="New Consultation"
        icon="pi pi-plus"
        iconPos="left"
        class="bg-black text-white border-none hover:bg-gray-800 text-sm px-4 py-2 rounded-md"
      />
    </header>

    <!-- Main Content -->
    <main class="flex-1 m-5 overflow-y-auto">
      <CustomAccordionTab />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CustomAccordionTab from '@/components/CustomAccordionTab.vue';
</script>
