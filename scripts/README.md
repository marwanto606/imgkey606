# Sitemap Generator

Dynamic sitemap generator untuk ImgKey606 yang fetch data dari API dan generate sitemap files secara otomatis.

## 📁 Files

- `utils.js` - Helper functions untuk XML generation
- `generate-sitemap.js` - Main script untuk generate sitemap
- `README.md` - Dokumentasi ini

## 🚀 Usage

### Manual Run

```bash
# Install dependencies (jika belum)
npm install

# Generate sitemap
npm run generate:sitemap
```

### Automatic via GitHub Actions

Sitemap akan di-generate secara otomatis:
- ✅ Setiap Minggu jam 2 pagi (UTC)
- ✅ Setiap kali push ke main branch (jika ada perubahan di scripts)
- ✅ Manual trigger dari GitHub Actions tab

## 📊 Output Files

Script akan generate 3 files di `public/` folder:

1. **sitemap.xml** - Sitemap index (master file)
2. **sitemap-static.xml** - Static pages (4 URLs)
3. **sitemap-images.xml** - Dynamic image pages (~1077 URLs)

## 🔧 Configuration

Edit `generate-sitemap.js` jika perlu mengubah:

```javascript
const BASE_URL = 'https://imgkey.lovable.app';
const API_BASE_URL = 'https://st-apis.marwanto606.qzz.io/creator';
const TOTAL_PAGES = 11; // Adjust based on total images
```

## 📝 Testing

### Local Testing

1. Run script:
```bash
npm run generate:sitemap
```

2. Check generated files:
```bash
ls -lh public/sitemap*.xml
```

3. Validate XML syntax:
```bash
xmllint --noout public/sitemap.xml
```

4. Test in browser:
```bash
npm run dev
# Open: http://localhost:8080/sitemap.xml
```

### Online Validation

1. Deploy to Lovable
2. Access: https://imgkey.lovable.app/sitemap.xml
3. Validate at: https://www.xml-sitemaps.com/validate-xml-sitemap.html
4. Submit to Google Search Console

## 🐛 Troubleshooting

### Error: Cannot find package 'node-fetch'

```bash
npm install node-fetch@3.3.2
```

### Error: ENOENT: no such file or directory

Make sure `public/` folder exists:
```bash
mkdir -p public
```

### GitHub Actions: Permission denied

Make sure repository has write permissions:
- Go to: Settings > Actions > General
- Set "Workflow permissions" to "Read and write permissions"

## 📊 Expected Output

```
🚀 Starting sitemap generation...

🔄 Fetching images from API...
  ↳ Fetching page 1/11...
  ✓ Page 1: 100 images fetched
  ...
✓ Total images fetched: 1077

📄 Generating static sitemap...
✓ Generated 4 static page entries
✓ Written: sitemap-static.xml (0.45 KB)

🖼️  Generating images sitemap...
✓ Generated 1077 image page entries
✓ Written: sitemap-images.xml (298.67 KB)

📑 Generating sitemap index...
✓ Generated sitemap index with 2 sitemaps
✓ Written: sitemap.xml (0.34 KB)

✅ Sitemap generation completed!

📊 Summary:
  • Total images: 1077
  • Static pages: 4
  • Total URLs: 1081
  • Generation time: 12.45s
  • Files created:
    - public/sitemap.xml (index)
    - public/sitemap-static.xml
    - public/sitemap-images.xml

🌐 Sitemap URLs:
  • https://imgkey.lovable.app/sitemap.xml
  • https://imgkey.lovable.app/sitemap-static.xml
  • https://imgkey.lovable.app/sitemap-images.xml

📝 Next steps:
  1. Deploy your app to Lovable
  2. Validate sitemap
  3. Submit to Google Search Console
```

## 🎯 SEO Benefits

- ✅ 1081 URLs indexed (4 static + 1077 images)
- ✅ Rich image snippets dengan metadata
- ✅ Weekly automatic updates
- ✅ Google Search Console compatible
- ✅ Proper XML structure dengan image tags

## 📚 Resources

- [Google Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Image Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
- [Sitemap XML Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
