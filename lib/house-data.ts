export type House = {
  id: string
  name: string
  category: 'rodinna' | 'mini' | 'luxusni' | 'rekreacni'
  size: string
  area: number
  priceFrom: string
  image: string // path under /public/images/
  description: string
}

export const houses: House[] = [
  // Rodinná hnízda
  {
    id: 'hnizdo-120',
    name: 'Hnízdo 120',
    category: 'rodinna',
    size: '4+kk',
    area: 120,
    priceFrom: 'od 3 250 000 Kč',
    image: '/images/hnizdo-120.jpg',
    description: 'Moderní rodinný dům 4+kk pro rodinu s dětmi.',
  },
  {
    id: 'hnizdo-95',
    name: 'Hnízdo 95',
    category: 'rodinna',
    size: '3+kk',
    area: 95,
    priceFrom: 'od 2 750 000 Kč',
    image: '/images/hnizdo-95.jpg',
    description: 'Kompaktní dům s chytrým půdorysem 3+kk.',
  },
  {
    id: 'hnizdo-150',
    name: 'Hnízdo 150',
    category: 'rodinna',
    size: '5+kk',
    area: 150,
    priceFrom: 'od 4 200 000 Kč',
    image: '/images/hnizdo-150.jpg',
    description: 'Prostorný dům 5+kk s velkým obývacím pokojem.',
  },

  // Mini hnízda
  {
    id: 'mini-35',
    name: 'Mini 35',
    category: 'mini',
    size: '1+kk',
    area: 35,
    priceFrom: 'od 950 000 Kč',
    image: '/images/mini-35.jpg',
    description: 'Mini dům pro 1–2 osoby, vhodný i jako rekreační.',
  },
  {
    id: 'mini-45',
    name: 'Mini 45',
    category: 'mini',
    size: '2+kk',
    area: 45,
    priceFrom: 'od 1 250 000 Kč',
    image: '/images/mini-45.jpg',
    description: 'Úsporné řešení 2+kk s plnohodnotným komfortem.',
  },

  // Luxusní hnízda
  {
    id: 'lux-180',
    name: 'Luxusní Hnízdo 180',
    category: 'luxusni',
    size: '5+kk',
    area: 180,
    priceFrom: 'od 6 900 000 Kč',
    image: '/images/lux-180.jpg',
    description: 'Reprezentativní dům s velkými proskleními a terasou.',
  },
  {
    id: 'lux-220',
    name: 'Luxusní Hnízdo 220',
    category: 'luxusni',
    size: '6+kk',
    area: 220,
    priceFrom: 'od 8 400 000 Kč',
    image: '/images/lux-220.jpg',
    description: 'Vlajková loď s nadstandardní výbavou a dispozicí.',
  },

  // Rekreační hnízda
  {
    id: 'chata-45',
    name: 'Rekreační Chata 45',
    category: 'rekreacni',
    size: '1+kk',
    area: 45,
    priceFrom: 'od 820 000 Kč',
    image: '/images/chata-45.jpg',
    description: 'Sezónní objekt s možností celoročního zateplení.',
  },
  {
    id: 'chata-60',
    name: 'Rekreační Chata 60',
    category: 'rekreacni',
    size: 60,
    area: 60,
    priceFrom: 'od 1 150 000 Kč',
    image: '/images/chata-60.jpg',
    description: 'Větší rekreační dům s krytou verandou.',
  },
]

export const categories = [
  { key: 'rodinna', title: 'Rodinná hnízda', href: '/typove-domy/rodinna-hnizda', description: 'Domy pro celou rodinu 3+kk až 6+kk.' },
  { key: 'mini', title: 'Mini hnízda', href: '/typove-domy/mini-hnizda', description: 'Kompaktní a úsporné varianty pro 1–2 osoby.' },
  { key: 'luxusni', title: 'Luxusní hnízda', href: '/typove-domy/luxusni-hnizda', description: 'Prémiové domy s nadstandardní výbavou.' },
  { key: 'rekreacni', title: 'Rekreační hnízda', href: '/typove-domy/rekreacni-hnizda', description: 'Chaty a rekreační objekty.' },
] as const
