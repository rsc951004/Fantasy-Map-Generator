export interface DragmaRealm {
  name: string;
  capital: string;
  target: [number, number];
}

export const DRAGMA_REALMS: DragmaRealm[] = [
  { name: "Waffengard", capital: "Stalheim", target: [0.625, 0.375] },
  { name: "Skarngard", capital: "Kragholm", target: [0.375, 0.375] },
  { name: "Flamengard", capital: "Askenburg", target: [0.125, 0.125] },
  { name: "Sturmgard", capital: "Nordvik", target: [0.125, 0.375] },
  { name: "Lumarya", capital: "Aurolis", target: [0.125, 0.625] },
  { name: "Veleskaria", capital: "Stancra", target: [0.875, 0.125] },
  { name: "Zefirya", capital: "Anemora", target: [0.125, 0.875] },
  { name: "Merenia", capital: "Aaltola", target: [0.375, 0.625] },
  { name: "Aurelia", capital: "Doracia", target: [0.625, 0.708] },
  { name: "Vesperya", capital: "Talasya", target: [0.375, 0.875] },
  { name: "Sindria", capital: "Bezdansk", target: [0.875, 0.208] },
  { name: "Ylvaria", capital: "Iratzar", target: [0.625, 0.875] }
];
