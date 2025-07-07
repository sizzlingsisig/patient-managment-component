import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
// Importing PrimeVue components
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Tooltip from 'primevue/tooltip';

import App from './App.vue';
import router from './router';
import './style.css';
const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue',
      },
    },
  },
});

app.use(router);
app.mount('#app');
app.component('Accordion', Accordion);
app.component('AccordionPanel', AccordionPanel);
app.component('AccordionHeader', AccordionHeader);
app.component('AccordionContent', AccordionContent);
app.component('Card', Card);
app.component('Tag', Tag);
app.directive('tooltip', Tooltip);
