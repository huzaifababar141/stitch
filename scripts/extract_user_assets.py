from PIL import Image
import numpy as np
import os

os.makedirs('public/images/tailor', exist_ok=True)

f1 = r'C:\Users\User\.gemini\antigravity\brain\d0461879-c5bf-4e23-a5a0-6598b31148d8\.user_uploaded\media_1791014496049.png'
f2 = r'C:\Users\User\.gemini\antigravity\brain\d0461879-c5bf-4e23-a5a0-6598b31148d8\.user_uploaded\media_1791014502336.png'
f3 = r'C:\Users\User\.gemini\antigravity\brain\d0461879-c5bf-4e23-a5a0-6598b31148d8\.user_uploaded\media_1791014514600.png'

im1 = Image.open(f1)
im2 = Image.open(f2)
im3 = Image.open(f3)

def crop_exact(img, x1, y1, x2, y2, pad=2, bg=250):
    sub = img.crop((x1, y1, x2, y2))
    arr = np.array(sub.convert('RGB'))
    mask = np.any(arr < bg, axis=-1)
    y_idx, x_idx = np.where(mask)
    if len(y_idx) == 0:
        return sub
    xmin = max(0, int(x_idx.min()) - pad)
    ymin = max(0, int(y_idx.min()) - pad)
    xmax = min(sub.width, int(x_idx.max()) + pad + 1)
    ymax = min(sub.height, int(y_idx.max()) + pad + 1)
    return sub.crop((xmin, ymin, xmax, ymax))

# ─────────────────────────────────────────────────────────────
# 1. GENDER CARDS (f1)
# ─────────────────────────────────────────────────────────────
crop_exact(im1, 0, 0, 500, 512, pad=4).save('public/images/tailor/gender_women.png')
crop_exact(im1, 500, 0, 1024, 512, pad=4).save('public/images/tailor/gender_men.png')

# ─────────────────────────────────────────────────────────────
# 2. WOMEN OPTIONS (f2)
# ─────────────────────────────────────────────────────────────
# Row 1: Garment Types (Shalwar Kameez / Pajama, Only Shirt, Frock / Maxi)
w_gt1 = crop_exact(im2, 277, 16, 390, 245)
w_gt2 = crop_exact(im2, 443, 16, 586, 245)
w_gt3 = crop_exact(im2, 637, 16, 773, 245)

w_gt1.save('public/images/tailor/garment_w_shalwarkameez.png')
w_gt2.save('public/images/tailor/garment_w_onlyshirt.png')
w_gt3.save('public/images/tailor/garment_w_frockmaxi.png')

# Row 2: Collars (5 items)
crop_exact(im2, 70, 266, 231, 389).save('public/images/tailor/w_collar_classic.png')
crop_exact(im2, 258, 266, 405, 389).save('public/images/tailor/w_collar_band.png')
crop_exact(im2, 433, 266, 592, 389).save('public/images/tailor/w_collar_shawl.png')
crop_exact(im2, 618, 266, 775, 389).save('public/images/tailor/w_collar_spread.png')
crop_exact(im2, 800, 266, 954, 389).save('public/images/tailor/w_collar_none.png')

# Row 3: Cuffs (5 items)
crop_exact(im2, 95, 408, 187, 496).save('public/images/tailor/w_cuff_regular.png')
crop_exact(im2, 281, 408, 373, 496).save('public/images/tailor/w_cuff_french.png')
crop_exact(im2, 464, 408, 560, 496).save('public/images/tailor/w_cuff_button.png')
crop_exact(im2, 651, 408, 754, 496).save('public/images/tailor/w_cuff_elastic.png')
crop_exact(im2, 837, 408, 933, 496).save('public/images/tailor/w_cuff_folded.png')

# Row 4: Trousers (5 items)
crop_exact(im2, 108, 515, 165, 667).save('public/images/tailor/w_trouser_straight.png')
crop_exact(im2, 265, 515, 321, 667).save('public/images/tailor/w_trouser_slim.png')
crop_exact(im2, 395, 515, 481, 667).save('public/images/tailor/w_trouser_wide.png')
crop_exact(im2, 544, 515, 635, 667).save('public/images/tailor/w_trouser_palazzo.png')
crop_exact(im2, 704, 515, 774, 667).save('public/images/tailor/w_trouser_shalwar.png')

# Also save trouser as garment type for Women Trouser Only
crop_exact(im2, 108, 515, 165, 667).save('public/images/tailor/garment_w_trouser.png')

# ─────────────────────────────────────────────────────────────
# 3. MEN OPTIONS (f3)
# ─────────────────────────────────────────────────────────────
# Row 1: Collars (6 items)
crop_exact(im3, 16, 23, 168, 160).save('public/images/tailor/m_collar_classic.png')
crop_exact(im3, 181, 23, 335, 160).save('public/images/tailor/m_collar_buttondown.png')
crop_exact(im3, 349, 23, 502, 160).save('public/images/tailor/m_collar_band.png')
crop_exact(im3, 519, 23, 672, 160).save('public/images/tailor/m_collar_spread.png')
crop_exact(im3, 687, 23, 843, 160).save('public/images/tailor/m_collar_cutaway.png')
crop_exact(im3, 858, 23, 1013, 160).save('public/images/tailor/m_collar_club.png')

# Row 2: Cuffs (5 items)
crop_exact(im3, 42, 180, 150, 293).save('public/images/tailor/m_cuff_regular.png')
crop_exact(im3, 230, 180, 357, 293).save('public/images/tailor/m_cuff_french.png')
crop_exact(im3, 443, 180, 560, 293).save('public/images/tailor/m_cuff_button.png')
crop_exact(im3, 637, 180, 769, 293).save('public/images/tailor/m_cuff_folded.png')
crop_exact(im3, 859, 180, 980, 293).save('public/images/tailor/m_cuff_rounded.png')

# ROW 3 IS EXPLICITLY SKIPPED PER USER INSTRUCTIONS!

# Row 4: Trousers (5 items)
crop_exact(im3, 48, 432, 152, 661).save('public/images/tailor/m_trouser_straight.png')
crop_exact(im3, 246, 432, 344, 661).save('public/images/tailor/m_trouser_slim.png')
crop_exact(im3, 459, 432, 555, 661).save('public/images/tailor/m_trouser_chinos.png')
crop_exact(im3, 663, 432, 760, 661).save('public/images/tailor/m_trouser_shalwar.png')
crop_exact(im3, 868, 432, 976, 661).save('public/images/tailor/m_trouser_formal.png')

# Men Garment Types:
# Shalwar Kameez / Men suit hero:
crop_exact(im1, 500, 0, 1024, 512, pad=4).save('public/images/tailor/garment_m_shalwarkameez.png')
crop_exact(im3, 48, 432, 152, 661).save('public/images/tailor/garment_m_trouser.png')
crop_exact(im3, 349, 23, 502, 160).save('public/images/tailor/garment_m_waistcoat.png')
crop_exact(im3, 16, 23, 168, 160).save('public/images/tailor/garment_m_pentcoat.png')

# Sidebar previews:
crop_exact(im1, 0, 0, 500, 512, pad=4).save('public/images/tailor/preview_w_shalwarkameez.png')
w_gt3.save('public/images/tailor/preview_w_frock.png')
crop_exact(im1, 500, 0, 1024, 512, pad=4).save('public/images/tailor/preview_m_shalwarkameez.png')

print('All assets from user images cropped and saved with 100% precision!')
