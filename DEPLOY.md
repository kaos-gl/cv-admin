# CV Admin Panel — Guía de Despliegue en Render.com

## Requisitos previos
- Proyecto Firebase con Firestore habilitado
- Cuenta en [Render.com](https://render.com)
- Repositorio Git (GitHub / GitLab) con este código

---

## 1. Configurar Firebase

### 1.1 Crear usuario admin en Firebase Authentication
1. Ve a **Firebase Console → Authentication → Users**
2. Haz clic en **Add user**
3. Ingresa el email y contraseña del administrador
4. Guarda las credenciales en un lugar seguro

### 1.2 Actualizar las reglas de Firestore
En **Firebase Console → Firestore → Rules**, aplica estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lectura pública para el CV (tu app de GitHub Pages)
    match /{document=**} {
      allow read: if true;
    }
    // Escritura solo para admins autenticados
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

### 1.3 Obtener las credenciales de Firebase
1. Ve a **Firebase Console → Project Settings (⚙️) → Your apps**
2. Si no tienes una Web App, haz clic en **Add app → Web**
3. Copia el objeto `firebaseConfig`

### 1.4 Pegar la config en los environments
Edita `src/environments/environment.ts` y `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false, // true en el archivo .prod.ts
  firebaseConfig: {
    apiKey: "AIzaSy...",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123...",
  },
};
```

---

## 2. Probar localmente

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Iniciar servidor de desarrollo (puerto 4201)
npm start

# Abre: http://localhost:4201
```

---

## 3. Desplegar en Render.com (con Docker)

### 3.1 Subir el código a GitHub
```bash
git init
git add .
git commit -m "feat: cv admin panel"
git remote add origin https://github.com/tu-usuario/cv-admin.git
git push -u origin main
```

### 3.2 Crear el servicio en Render
1. Entra a [render.com](https://render.com) → **New → Web Service**
2. Conecta tu repositorio de GitHub
3. Configura el servicio:

| Campo | Valor |
|-------|-------|
| **Name** | `cv-admin` |
| **Environment** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |
| **Branch** | `main` |
| **Instance Type** | Free (o Starter para producción) |

4. En **Environment Variables**, agrega estas variables para que la config de Firebase no quede en el código:

> **Alternativa más segura:** En lugar de hardcodear la config en `environment.prod.ts`, usa variables de entorno en Render y un script de build que las inyecte.

```bash
# Variables en Render Dashboard → Environment
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123...
```

Para usar variables de entorno en el build, crea un script `set-env.sh`:

```bash
#!/bin/sh
# set-env.sh — ejecutar antes del build en Render
cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "${FIREBASE_API_KEY}",
    authDomain: "${FIREBASE_AUTH_DOMAIN}",
    projectId: "${FIREBASE_PROJECT_ID}",
    storageBucket: "${FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${FIREBASE_APP_ID}",
  },
};
EOF
```

Y en el Dockerfile, añade antes del `npm run build`:
```dockerfile
RUN chmod +x set-env.sh && ./set-env.sh
```

5. Haz clic en **Create Web Service**

### 3.3 URL del panel
Render te asignará una URL como:
```
https://cv-admin.onrender.com
```

> **Nota:** El plan gratuito de Render "duerme" el servicio tras 15 min de inactividad. El primer request puede tardar ~30s. Para producción real, usa el plan **Starter** ($7/mes).

---

## 4. Arquitectura final

```
┌─────────────────────────────────────────────────┐
│              Firebase (Backend)                  │
│  ┌─────────────┐    ┌──────────────────────────┐ │
│  │  Firestore  │    │    Authentication         │ │
│  │  (datos CV) │    │    (admin user)           │ │
│  └──────┬──────┘    └────────────┬─────────────┘ │
└─────────┼───────────────────────┼────────────────┘
          │                       │
          │ read (público)        │ auth + write
          │                       │
┌─────────┴──────┐    ┌───────────┴───────────────┐
│  GitHub Pages  │    │     Render.com             │
│  (CV público)  │    │     (Admin Panel)          │
│  Angular app   │    │     Docker + Nginx          │
│  tu-usuario    │    │     cv-admin.onrender.com  │
│  .github.io    │    │                            │
└────────────────┘    └────────────────────────────┘
```

---

## 5. Estructura de colecciones en Firestore

```
firestore/
├── skills/          { name, percentaje }
├── work-experience/ { position, company, location, startDate, endDate, accomplishments }
├── education/       { degree, university, startDate, endDate }
├── certificates/    { title, Description, year }
├── interests/       { name }
└── languages/       { language1, language2 }
```

---

## 6. Agregar nuevas secciones al CMS

Para agregar una nueva sección (ej. "Projects"), solo edita `src/app/models/section.config.ts`:

```typescript
{
  label: 'Projects',
  path: 'projects',
  icon: '🚀',
  orderField: 'name',
  fields: [
    { key: 'name', label: 'Project Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { key: 'url', label: 'URL', type: 'url', placeholder: 'https://...' },
    { key: 'year', label: 'Year', type: 'text' },
  ],
},
```

¡No se requiere ningún otro cambio! El componente CRUD es completamente dinámico.
