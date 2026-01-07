# Guía de Solución de Errores Comunes - Immersive English Books App

Este documento recopila los problemas técnicos encontrados durante el desarrollo y sus respectivas soluciones. Úsalo como referencia si la aplicación vuelve a presentar fallos de carga o errores similares.

## 1. Carga Infinita (Infinite Loading) al iniciar `npm run dev`

**Síntoma:**
La terminal muestra "Starting..." y el navegador se queda cargando `localhost:3000` indefinidamente sin mostrar contenido ni errores, o lanza un error de conexión después de mucho tiempo.

**Causa:**
Incompatibilidad entre **Next.js 16 (Turbopack)** y ciertas librerías complejas como `pdfjs-dist`. Turbopack es el nuevo compilador por defecto, pero aún tiene problemas experimentales con alias de módulos nativos de Node.js.

**Solución:**
Desactivar Turbopack y usar el compilador clásico **Webpack**.

1. Detén el servidor actual (`Ctrl + C`).
2. Ejecuta el servidor forzando el modo Webpack:
   ```bash
   npm run dev -- --webpack
   ```

*Nota: Hemos configurado `next.config.ts` para manejar la configuración de webpack, por lo que el comando anterior asegura que se use esa configuración.*

---

## 2. Error "Module not found: Can't resolve 'canvas'"

**Síntoma:**
La aplicación falla al compilar o el navegador muestra un error relacionado con el paquete `canvas`.

**Causa:**
La librería `pdfjs-dist` intenta importar `canvas` (una librería gráfica para servidores Node.js) para renderizar PDFs en el servidor. Esta librería no existe ni es necesaria en el navegador.

**Solución:**
Configurar Next.js para ignorar este módulo en la compilación.

En `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  transpilePackages: ['react-pdf', 'pdfjs-dist'], // Asegura que se procesen estas librerías
  webpack: (config) => {
    // Dice a Webpack que ignore la importación de 'canvas'
    config.resolve.alias.canvas = false;
    return config;
  },
};
```

---

## 3. El Visor de PDF no carga o se queda en blanco

**Síntoma:**
La página carga, pero el área del PDF muestra "Cargando experiencia..." eternamente o aparece en blanco.

**Causa:**
El "Worker" de PDF.js (el script que procesa el archivo en segundo plano) no se está cargando correctamente. Esto suele pasar por:
1. Versiones incorrectas (mismatch entre `react-pdf` y el worker).
2. Intentar cargar el worker en el servidor (SSR) donde no hay ventana (`window`).

**Solución:**
1. **Definición Explícita de Versión:** Usar la versión exacta instalada para llamar al CDN.
2. **Protección del Lado del Cliente:** Envolver la configuración en un condicional.

En `app/components/reader/PDFViewer.tsx`:
```typescript
import { version as pdfjsVersion } from 'pdfjs-dist';

// Solo configurar el worker si estamos en el navegador
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
}
```

---

## 4. Puerto Ocupado (EADDRINUSE: 3000)

**Síntoma:**
Al intentar iniciar la app, dice que el puerto 3000 ya está en uso.

**Causa:**
Un proceso anterior de Node.js no se cerró correctamente y quedó "zombie" ocupando el puerto.

**Solución:**
Matar todos los procesos de Node.js.

**En Windows (PowerShell/CMD):**
```powershell
taskkill /F /IM node.exe
```
Luego vuelve a intentar `npm run dev`.

---

## 5. Estilos o Animaciones Rotas (Magic Cards invisibles)

**Síntoma:**
La página de inicio carga pero faltan elementos visuales, o las tarjetas se ven sin estilo.

**Causa:**
Faltan dependencias críticas de utilidad que se usan en los componentes UI reutilizables.
- `tailwind-merge`: Usada por la función `cn()` para combinar clases CSS.
- `framer-motion`: Usada para todas las animaciones de entrada.

**Solución:**
Instalar las dependencias faltantes:
```bash
npm install tailwind-merge framer-motion clsx
```

---

## Resumen de Comandos de Rescate

Si todo falla, sigue esta secuencia "limpia":

1. **Limpiar procesos:** `taskkill /F /IM node.exe`
2. **Borrar caché de Next:** Elimina la carpeta `.next`
3. **Reinstalar (opcional):** `npm install`
4. **Iniciar con Webpack:** `npm run dev -- --webpack`
