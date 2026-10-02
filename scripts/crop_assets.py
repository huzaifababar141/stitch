from PIL import Image
import os

os.makedirs('public/images/tailor', exist_ok=True)

im1 = Image.open(r'C:\Users\User\.gemini\antigravity\brain\d0461879-c5bf-4e23-a5a0-6598b31148d8\.user_uploaded\media_1790953359300.png')
im2 = Image.open(r'C:\Users\User\.gemini\antigravity\brain\d0461879-c5bf-4e23-a5a0-6598b31148d8\.user_uploaded\media_1790953447290.png')
im3 = Image.open(r'C:\Users\User\.gemini\antigravity\brain\d0461879-c5bf-4e23-a5a0-6598b31148d8\.user_uploaded\media_1790953825858.png')
im4 = Image.open(r'C:\Users\User\.gemini\antigravity\brain\d0461879-c5bf-4e23-a5a0-6598b31148d8\.user_uploaded\media_1790953833523.png')

# ─────────────────────────────────────────────────────────────
# 1. GENDER CARDS (im1)
# ─────────────────────────────────────────────────────────────
im1.crop((202, 238, 238, 298)).save('public/images/tailor/gender_women.png')
im1.crop((482, 240, 520, 296)).save('public/images/tailor/gender_men.png')

# ─────────────────────────────────────────────────────────────
# 2. GARMENT TYPES (Step 1 & Step 2)
# ─────────────────────────────────────────────────────────────
# Women
im2.crop((220, 145, 275, 218)).save('public/images/tailor/garment_w_shalwarkameez.png')
im2.crop((362, 145, 417, 218)).save('public/images/tailor/garment_w_onlyshirt.png')
im2.crop((502, 145, 560, 218)).save('public/images/tailor/garment_w_frockmaxi.png')
im2.crop((225, 545, 255, 600)).save('public/images/tailor/garment_w_trouser.png')

# Men
im3.crop((833, 110, 873, 192)).save('public/images/tailor/garment_m_shalwarkameez.png')
im3.crop((232, 492, 258, 552)).save('public/images/tailor/garment_m_trouser.png')
im3.crop((330, 170, 390, 225)).save('public/images/tailor/garment_m_waistcoat.png') # band collar men
im3.crop((220, 170, 280, 225)).save('public/images/tailor/garment_m_pentcoat.png')  # classic collar men

# ─────────────────────────────────────────────────────────────
# 3. WOMEN CUSTOMIZATION OPTIONS (im2)
# ─────────────────────────────────────────────────────────────
# Collar Design: row y = 304 to 355
# 5 cards across: Classic, Band, Shawl, Spread, No Collar
# Card x boundaries:
# 1: 195-280, 2: 306-391, 3: 417-502, 4: 528-613, 5: 639-724
im2.crop((200, 304, 275, 355)).save('public/images/tailor/w_collar_classic.png')
im2.crop((311, 304, 386, 355)).save('public/images/tailor/w_collar_band.png')
im2.crop((422, 304, 497, 355)).save('public/images/tailor/w_collar_shawl.png')
im2.crop((533, 304, 608, 355)).save('public/images/tailor/w_collar_spread.png')
im2.crop((644, 304, 719, 355)).save('public/images/tailor/w_collar_none.png')

# Cuff Design: row y = 427 to 475
# 5 cards across: Regular, French, Button, Folded, Elastic
im2.crop((215, 427, 260, 475)).save('public/images/tailor/w_cuff_regular.png')
im2.crop((326, 427, 371, 475)).save('public/images/tailor/w_cuff_french.png')
im2.crop((437, 427, 482, 475)).save('public/images/tailor/w_cuff_button.png')
im2.crop((548, 427, 593, 475)).save('public/images/tailor/w_cuff_folded.png')
im2.crop((659, 427, 704, 475)).save('public/images/tailor/w_cuff_elastic.png')

# Trouser Design: row y = 545 to 600
# 5 cards across: Straight Fit, Slim Fit, Wide Leg, Palazzo, Shalwar Style
im2.crop((225, 545, 255, 600)).save('public/images/tailor/w_trouser_straight.png')
im2.crop((336, 545, 366, 600)).save('public/images/tailor/w_trouser_slim.png')
im2.crop((442, 545, 482, 600)).save('public/images/tailor/w_trouser_wide.png')
im2.crop((553, 545, 593, 600)).save('public/images/tailor/w_trouser_palazzo.png')
im2.crop((664, 545, 704, 600)).save('public/images/tailor/w_trouser_shalwar.png')

# ─────────────────────────────────────────────────────────────
# 4. MEN CUSTOMIZATION OPTIONS (im3)
# ─────────────────────────────────────────────────────────────
# Collar Design: row y = 170 to 225
# 4 cards across: Classic, Band, Shawl, Spread
im3.crop((215, 170, 285, 225)).save('public/images/tailor/m_collar_classic.png')
im3.crop((326, 170, 396, 225)).save('public/images/tailor/m_collar_band.png')
im3.crop((437, 170, 507, 225)).save('public/images/tailor/m_collar_shawl.png')
im3.crop((548, 170, 618, 225)).save('public/images/tailor/m_collar_spread.png')

# Cuff Design: row y = 330 to 385
# 4 cards across: Regular, French, Button, Folded
im3.crop((215, 330, 285, 385)).save('public/images/tailor/m_cuff_regular.png')
im3.crop((326, 330, 396, 385)).save('public/images/tailor/m_cuff_french.png')
im3.crop((437, 330, 507, 385)).save('public/images/tailor/m_cuff_button.png')
im3.crop((548, 330, 618, 385)).save('public/images/tailor/m_cuff_folded.png')

# Trouser Design: row y = 490 to 555
# 4 cards across: Straight Fit, Slim Fit, Wide Leg, Shalwar Style
im3.crop((230, 492, 260, 555)).save('public/images/tailor/m_trouser_straight.png')
im3.crop((341, 492, 371, 555)).save('public/images/tailor/m_trouser_slim.png')
im3.crop((447, 492, 487, 555)).save('public/images/tailor/m_trouser_wide.png')
im3.crop((558, 492, 598, 555)).save('public/images/tailor/m_trouser_shalwar.png')

# ─────────────────────────────────────────────────────────────
# 5. FROCK CUSTOMIZATION OPTIONS (im4)
# ─────────────────────────────────────────────────────────────
# Neckline Design: row y = 335 to 378 (left half: x 195 to 550)
im4.crop((198, 335, 255, 378)).save('public/images/tailor/frock_neck_round.png')
im4.crop((272, 335, 329, 378)).save('public/images/tailor/frock_neck_v.png')
im4.crop((346, 335, 403, 378)).save('public/images/tailor/frock_neck_square.png')
im4.crop((420, 335, 477, 378)).save('public/images/tailor/frock_neck_boat.png')
im4.crop((494, 335, 551, 378)).save('public/images/tailor/frock_neck_keyhole.png')

# Sleeve Design: row y = 335 to 378 (right half: x 580 to 935)
im4.crop((583, 335, 640, 378)).save('public/images/tailor/frock_sleeve_full.png')
im4.crop((657, 335, 714, 378)).save('public/images/tailor/frock_sleeve_threequarter.png')
im4.crop((731, 335, 788, 378)).save('public/images/tailor/frock_sleeve_bell.png')
im4.crop((805, 335, 862, 378)).save('public/images/tailor/frock_sleeve_puff.png')
im4.crop((879, 335, 936, 378)).save('public/images/tailor/frock_sleeve_sleeveless.png')

# Frock Style: row y = 450 to 500 (left half: x 195 to 550)
im4.crop((205, 450, 248, 500)).save('public/images/tailor/frock_style_aline.png')
im4.crop((279, 450, 322, 500)).save('public/images/tailor/frock_style_straight.png')
im4.crop((353, 450, 396, 500)).save('public/images/tailor/frock_style_flared.png')
im4.crop((427, 450, 470, 500)).save('public/images/tailor/frock_style_anarkali.png')
im4.crop((501, 450, 544, 500)).save('public/images/tailor/frock_style_tiered.png')

# Daman Design: row y = 450 to 500 (right half: x 580 to 935)
im4.crop((583, 450, 640, 500)).save('public/images/tailor/frock_daman_straight.png')
im4.crop((657, 450, 714, 500)).save('public/images/tailor/frock_daman_curved.png')
im4.crop((731, 450, 788, 500)).save('public/images/tailor/frock_daman_scalloped.png')
im4.crop((805, 450, 862, 500)).save('public/images/tailor/frock_daman_highlow.png')
im4.crop((879, 450, 936, 500)).save('public/images/tailor/frock_daman_embroidered.png')

# Additional Options: row y = 565 to 595 (x 195 to 770)
im4.crop((195, 565, 266, 598)).save('public/images/tailor/frock_opt_pocket.png')
im4.crop((280, 565, 351, 598)).save('public/images/tailor/frock_opt_button.png')
im4.crop((365, 565, 436, 598)).save('public/images/tailor/frock_opt_lace.png')
im4.crop((450, 565, 521, 598)).save('public/images/tailor/frock_opt_piping.png')
im4.crop((535, 565, 606, 598)).save('public/images/tailor/frock_opt_embroidery.png')
im4.crop((620, 565, 691, 598)).save('public/images/tailor/frock_opt_belt.png')
im4.crop((705, 565, 776, 598)).save('public/images/tailor/frock_opt_border.png')

# ─────────────────────────────────────────────────────────────
# 6. SIDEBAR FULL SUIT PREVIEWS
# ─────────────────────────────────────────────────────────────
im2.crop((833, 108, 870, 192)).save('public/images/tailor/preview_w_shalwarkameez.png')
im4.crop((833, 108, 870, 192)).save('public/images/tailor/preview_w_frock.png')
im3.crop((833, 108, 873, 192)).save('public/images/tailor/preview_m_shalwarkameez.png')

print('All assets cropped cleanly and successfully!')
