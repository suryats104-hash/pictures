export const PHOTO_SLOTS = [
  { id: 'frontal', title: 'Frontal View', hint: 'Teeth together, lips relaxed', icon: 'sentiment-satisfied-alt' },
  { id: 'upper',   title: 'Upper Arch',   hint: 'Tilt head back, mouth wide open', icon: 'expand-less' },
  { id: 'lower',   title: 'Lower Arch',   hint: 'Tilt chin down, mouth wide open',  icon: 'expand-more' },
  { id: 'left',    title: 'Left Side',    hint: 'Pull cheek back, expose molars',   icon: 'arrow-back' },
  { id: 'right',   title: 'Right Side',   hint: 'Pull cheek back, expose molars',   icon: 'arrow-forward' },
];

export const slotById = (id) => PHOTO_SLOTS.find((s) => s.id === id);
export const REQUIRED_PHOTOS = PHOTO_SLOTS.length;
