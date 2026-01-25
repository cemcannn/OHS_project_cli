## OHS Program CLI (Angular)

Bu repo bir **Angular** uygulamasıdır (bağımlılıklar `package.json` içinde). Projeyi yeniden indirdiğinizde/klonladığınızda hızlıca çalıştırmak için aşağıdaki adımlar yeterlidir.

### Gereksinimler

- **Node.js**: Tercihen **Node 22 (LTS)** (npm ile birlikte gelir)
- **npm**: Node ile gelir

> macOS + Homebrew kullanıyorsanız:
>
> - **Node 22 kur**: `brew install node@22`
> - **Node 22’yi PATH’e al**: `brew link --force --overwrite node@22`

### Kurulum

Proje klasöründe:

```bash
npm install
```

### Uygulamayı çalıştırma (dev server)

```bash
npm start
```

- **Uygulama adresi**: `http://localhost:4200/`
- Durdurmak için: **Ctrl + C**

### Backend / API adresi

Uygulamanın API base URL’i şu dosyada tanımlıdır:

- `src/enviroments/enviroment.prod.ts`

Varsayılan değer:

- `https://localhost:7170/api`

Backend farklı bir adreste çalışıyorsa bu dosyadaki `baseUrl` değerini güncelleyin.

### Build (prod çıktısı)

```bash
npm run build
```

- Çıktı dizini: `dist/ohs-program-cli`

### Test

```bash
npm test
```

### Sık karşılaşılan sorunlar

- **4200 portu doluysa**: Çalışan başka bir Angular/Node sürecini durdurun veya farklı portla başlatın: `npx ng serve --port 4300`
- **Node sürümü uyumsuzsa**: `node -v` ile sürümü kontrol edin; mümkünse Node 22 kullanın.
