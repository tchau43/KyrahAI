import { Resources } from '../types';

export const resources: Resources[] = [
  {
    id: '01',
    country: 'United States',
    hotlines: [
      {
        label: 'National Domestic Violence Hotline',
        contact: '1-800-799-SAFE (7233)',
      },
      {
        label: 'RAINN Sexual Violence Hotline',
        contact: '1-800-656-HOPE (4673)',
      },
      {
        label: '988 Suicide & Crisis Lifeline',
        contact: 'Dial 988 for immediate support',
      },
    ],
  },
  {
    id: '02',
    country: 'United Kingdom',
    hotlines: [
      {
        label: 'Women’s Aid',
        contact: 'Live chat and email support at womensaid.org.uk',
      },
      {
        label: 'Samaritans (Suicide Prevention)',
        contact: '116 123 (freephone, 24/7)',
      },
    ],
  },
  {
    id: '03',
    country: 'Global',
    hotlines: [
      {
        label: 'UNFPA GBV Dashboard',
        contact: 'Country-level data and resources on gender-based violence',
      },
      {
        label: 'UNHCR GBV Toolkit',
        contact:
          'Guidance, tools, and resource lists for survivors and responders',
      },
      {
        label: 'Befrienders Worldwide',
        contact:
          ' International suicide prevention hotlines at befrienders.org',
      },
    ],
  },
  {
    id: '04',
    country: 'Coming soon',
    hotlines: [
      {
        label: 'Region-specific verified partners and local hotlines',
        contact:
          ' will be added as Kyrah.ai expands, ensuring access to trusted support wherever you are.',
      },
    ],
  },
];
