export interface DesignOption {
  name: string;
  image: string;
}

export const WOMEN_COLLARS: DesignOption[] = [
  { name: 'Band Collar', image: '/images/tailor/w_collar_band.png' },
  { name: 'Round Neck', image: '/images/tailor/w_collar_none.png' },
  { name: 'V-Neck', image: '/images/tailor/w_collar_shawl.png' },
  { name: 'Open Neck Collar', image: '/images/tailor/w_collar_classic.png' },
];

export const WOMEN_CUFFS: DesignOption[] = [
  { name: 'Straight Sleeve', image: '/images/tailor/w_cuff_regular.png' },
  { name: 'Regular Cuff Sleeve', image: '/images/tailor/w_cuff_french.png' },
  { name: 'Flared Sleeve', image: '/images/tailor/w_cuff_button.png' },
  { name: 'Bell Sleeve', image: '/images/tailor/w_cuff_folded.png' },
];

export const WOMEN_TROUSERS: DesignOption[] = [
  { name: 'Straight Trouser', image: '/images/tailor/w_trouser_straight.png' },
  { name: 'Cigarette Trouser', image: '/images/tailor/w_trouser_slim.png' },
  { name: 'Wide-Leg Trouser', image: '/images/tailor/w_trouser_wide.png' },
  { name: 'Tapered Trouser', image: '/images/tailor/w_trouser_palazzo.png' },
];

export const WOMEN_SHALWARS: DesignOption[] = [
  { name: 'Classic Shalwar', image: '/images/tailor/w_trouser_shalwar.png' },
  { name: 'Patiala Shalwar', image: '/images/tailor/w_trouser_wide.png' },
  { name: 'Dhoti Shalwar', image: '/images/tailor/w_trouser_palazzo.png' },
  { name: 'Straight Shalwar', image: '/images/tailor/w_trouser_straight.png' },
];

export const MEN_COLLARS: DesignOption[] = [
  { name: 'Plain Collar', image: '/images/tailor/m_collar_classic.png' },
  { name: 'Band Collar', image: '/images/tailor/m_collar_band.png' },
  { name: 'Sherwani Collar', image: '/images/tailor/m_collar_spread.png' },
  { name: 'Round Neck', image: '/images/tailor/m_collar_buttondown.png' },
];

export const MEN_CUFFS: DesignOption[] = [
  { name: 'Plain Cuff', image: '/images/tailor/m_cuff_regular.png' },
  { name: 'Button Cuff', image: '/images/tailor/m_cuff_button.png' },
  { name: 'French Cuff', image: '/images/tailor/m_cuff_french.png' },
  { name: 'Double Button Cuff', image: '/images/tailor/m_cuff_folded.png' },
];

export const MEN_TROUSERS: DesignOption[] = [
  { name: 'Straight Trouser', image: '/images/tailor/m_trouser_straight.png' },
  { name: 'Slim-Fit Trouser', image: '/images/tailor/m_trouser_slim.png' },
  { name: 'Tapered Trouser', image: '/images/tailor/m_trouser_chinos.png' },
  { name: 'Wide-Leg Trouser', image: '/images/tailor/m_trouser_formal.png' },
];

export const MEN_SHALWARS: DesignOption[] = [
  { name: 'Classic Shalwar', image: '/images/tailor/m_trouser_shalwar.png' },
  { name: 'Peshawari Shalwar', image: '/images/tailor/m_trouser_straight.png' },
  { name: 'Kandahari Shalwar', image: '/images/tailor/m_trouser_wide.png' },
  { name: 'Dhoti Shalwar', image: '/images/tailor/w_trouser_palazzo.png' },
];

export const FROCK_NECKLINES: DesignOption[] = [
  { name: 'Round', image: '/images/tailor/frock_neck_round.png' },
  { name: 'V-Neck', image: '/images/tailor/frock_neck_v.png' },
  { name: 'Square', image: '/images/tailor/frock_neck_square.png' },
  { name: 'Boat', image: '/images/tailor/frock_neck_boat.png' },
  { name: 'Keyhole', image: '/images/tailor/frock_neck_keyhole.png' },
];

export const FROCK_SLEEVES: DesignOption[] = [
  { name: 'Full', image: '/images/tailor/frock_sleeve_full.png' },
  { name: '3/4', image: '/images/tailor/frock_sleeve_threequarter.png' },
  { name: 'Bell', image: '/images/tailor/frock_sleeve_bell.png' },
  { name: 'Belt', image: '/images/tailor/frock_opt_belt.png' },
  { name: 'Puff', image: '/images/tailor/frock_sleeve_puff.png' },
];

export const FROCK_STYLES: DesignOption[] = [
  { name: 'A-Line', image: '/images/tailor/frock_style_aline.png' },
  { name: 'Straight', image: '/images/tailor/frock_style_straight.png' },
  { name: 'Flared', image: '/images/tailor/frock_style_flared.png' },
  { name: 'Anarkali', image: '/images/tailor/frock_style_anarkali.png' },
  { name: 'Tiered', image: '/images/tailor/frock_style_tiered.png' },
];

export const FROCK_DAMANS: DesignOption[] = [
  { name: 'Straight', image: '/images/tailor/frock_daman_straight.png' },
  { name: 'Curved', image: '/images/tailor/frock_daman_curved.png' },
  { name: 'Scalloped', image: '/images/tailor/frock_daman_scalloped.png' },
  { name: 'High-Low', image: '/images/tailor/frock_daman_highlow.png' },
  { name: 'Round', image: '/images/tailor/frock_daman_curved.png' },
];

export const WAISTCOAT_COLLARS: DesignOption[] = [
  { name: 'Classic V-Neck', image: '/images/tailor/w_collar_shawl.png' },
  { name: 'Band Collar', image: '/images/tailor/m_collar_band.png' },
  { name: 'Sherwani Collar', image: '/images/tailor/m_collar_spread.png' },
];

export const WAISTCOAT_SLEEVES: DesignOption[] = [
  {
    name: 'Plain Straight Sleeves',
    image: '/images/tailor/m_cuff_regular.png',
  },
  { name: 'Button Cuff Sleeves', image: '/images/tailor/m_cuff_button.png' },
  { name: 'Plain Cuff Sleeves', image: '/images/tailor/m_cuff_french.png' },
  {
    name: 'Double Button Cuff Sleeves',
    image: '/images/tailor/m_cuff_folded.png',
  },
];

export const PANT_COAT_STYLES: DesignOption[] = [
  {
    name: 'Single-Breasted 2 Button',
    image: '/images/tailor/garment_m_pentcoat.png',
  },
  {
    name: 'Single-Breasted 3 Button',
    image: '/images/tailor/garment_m_pentcoat.png',
  },
  {
    name: 'Double-Breasted 4 Button',
    image: '/images/tailor/garment_m_pentcoat.png',
  },
  {
    name: 'Double-Breasted 6 Button',
    image: '/images/tailor/garment_m_pentcoat.png',
  },
];

export const PANT_COAT_LAPELS: DesignOption[] = [
  { name: 'Notch Lapel', image: '/images/tailor/m_collar_spread.png' },
  { name: 'Peak Lapel', image: '/images/tailor/m_collar_classic.png' },
  { name: 'Shawl Lapel', image: '/images/tailor/w_collar_shawl.png' },
  { name: 'Band Collar', image: '/images/tailor/m_collar_band.png' },
];

export const PANT_COAT_POCKETS: DesignOption[] = [
  { name: 'Straight Flap Pocket', image: '/images/tailor/frock_opt_belt.png' },
  { name: 'Slanted Flap Pocket', image: '/images/tailor/frock_opt_belt.png' },
  { name: 'Jetted Pocket', image: '/images/tailor/frock_opt_belt.png' },
  { name: 'Patch Pocket', image: '/images/tailor/frock_opt_belt.png' },
];

export const PANT_COAT_CUFFS: DesignOption[] = [
  { name: 'Plain Sleeve', image: '/images/tailor/m_cuff_regular.png' },
  { name: 'Button Cuff', image: '/images/tailor/m_cuff_button.png' },
  { name: 'Functional Button Cuff', image: '/images/tailor/m_cuff_french.png' },
  { name: "Surgeon's Cuff", image: '/images/tailor/m_cuff_folded.png' },
];

export const PANT_COAT_VENTS: DesignOption[] = [
  { name: 'Single Vent', image: '/images/tailor/m_trouser_straight.png' },
  { name: 'Double Vent', image: '/images/tailor/m_trouser_straight.png' },
  { name: 'No Vent', image: '/images/tailor/m_trouser_straight.png' },
];

export const PANT_COAT_TROUSER_DESIGNS: DesignOption[] = [
  { name: 'Straight Fit', image: '/images/tailor/m_trouser_straight.png' },
  { name: 'Slim Fit', image: '/images/tailor/m_trouser_slim.png' },
  { name: 'Tapered Fit', image: '/images/tailor/m_trouser_chinos.png' },
  { name: 'Pleated Trouser', image: '/images/tailor/m_trouser_formal.png' },
];

export const PANT_COAT_TROUSER_WAISTS: DesignOption[] = [
  { name: 'Belt Loops', image: '/images/tailor/m_trouser_straight.png' },
  { name: 'Side Adjusters', image: '/images/tailor/m_trouser_slim.png' },
  { name: 'Button Waist', image: '/images/tailor/m_trouser_chinos.png' },
  { name: 'Extended Waistband', image: '/images/tailor/m_trouser_formal.png' },
];

export const PANT_COAT_TROUSER_POCKETS: DesignOption[] = [
  {
    name: 'Side Slant Pockets',
    image: '/images/tailor/m_trouser_straight.png',
  },
  { name: 'Straight Side Pockets', image: '/images/tailor/m_trouser_slim.png' },
  { name: 'Jetted Back Pockets', image: '/images/tailor/m_trouser_chinos.png' },
  { name: 'Button Back Pockets', image: '/images/tailor/m_trouser_formal.png' },
];

export const PANT_COAT_TROUSER_BOTTOMS: DesignOption[] = [
  { name: 'Plain Hem', image: '/images/tailor/m_trouser_straight.png' },
  { name: 'Cuffed / Turn-Up', image: '/images/tailor/m_trouser_formal.png' },
  { name: 'No Break', image: '/images/tailor/m_trouser_slim.png' },
  { name: 'Half Break', image: '/images/tailor/m_trouser_chinos.png' },
];
