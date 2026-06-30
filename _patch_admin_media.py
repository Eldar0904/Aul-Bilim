from pathlib import Path

ROOT = Path(__file__).resolve().parent

# admin.html
p = ROOT / "admin.html"
t = p.read_text(encoding="utf-8")
t = t.replace(
    '<script src="uploads/db.js"></script>\n<link rel="stylesheet" href="admin.css?v=2" />',
    '<script src="uploads/db.js"></script>\n<script src="uploads/media-config.js"></script>\n<script src="uploads/media-upload.js"></script>\n<link rel="stylesheet" href="admin.css?v=3" />',
)
old_hero = """                <div style="padding:12px 16px;background:rgba(27,79,138,0.06);border-top:1px solid var(--line);">
                  <label class="se-label" for="school-field-image">Hero сурет URL</label>
                  <input class="se-input" type="text" id="school-field-image" placeholder="assets/optimized/… немесе https://…">
                </div>"""
new_hero = """                <div style="padding:12px 16px;background:rgba(27,79,138,0.06);border-top:1px solid var(--line);">
                  <label class="se-label" for="school-field-image">Hero сурет URL</label>
                  <div class="se-upload-row">
                    <input class="se-input" type="text" id="school-field-image" placeholder="assets/optimized/… немесе https://…">
                    <button type="button" class="se-upload-btn" id="school-hero-upload-btn">Жүктеу</button>
                    <input type="file" id="school-hero-upload-file" accept="image/png,image/jpeg,image/webp,image/avif" hidden>
                  </div>
                </div>"""
t = t.replace(old_hero, new_hero)
old_gal = """                    <textarea class="se-textarea" id="school-field-gallery" rows="5" placeholder="assets/optimized/school-photo-1.jpg
assets/optimized/school-photo-2.jpg
https://…"></textarea>
                    <p class="se-hint">Carousel суреттері — әр URL жаңа жолдан. Алғашқы сурет Hero ретінде де пайдаланылады.</p>"""
new_gal = """                    <textarea class="se-textarea" id="school-field-gallery" rows="5" placeholder="assets/optimized/school-photo-1.jpg
assets/optimized/school-photo-2.jpg
https://…"></textarea>
                    <div class="se-upload-row" style="margin-top:10px;">
                      <button type="button" class="se-upload-btn" id="school-gallery-upload-btn">Галереяға қосу</button>
                      <input type="file" id="school-gallery-upload-file" accept="image/png,image/jpeg,image/webp,image/avif" multiple hidden>
                    </div>
                    <p class="se-hint">Carousel суреттері — әр URL жаңа жолдан. Алғашқы сурет Hero ретінде де пайдаланылады.</p>"""
t = t.replace(old_gal, new_gal)
t = t.replace("admin-cms.js?v=3", "admin-cms.js?v=4")
t = t.replace("admin-schools.js?v=2", "admin-schools.js?v=3")
p.write_text(t, encoding="utf-8")
print("admin.html ok")
