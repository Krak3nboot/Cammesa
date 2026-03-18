# Dashboard de Costo Marginal Operado

Este proyecto es una web estática en JavaScript lista para desplegar en Vercel.

## Qué incluye

- Evolución mensual del costo marginal operado
- Serie diaria
- Promedio por hora
- Comparativa por:
  - región
  - tecnología
  - fuente de generación
  - tipo de combustible
- Filtros por año, métrica y top de categorías

## Estructura

- `index.html`: interfaz principal
- `styles.css`: estilos
- `app.js`: lógica de filtros y gráficos
- `data/dashboard-data.js`: datos procesados desde el Excel

## Cómo verlo en local

Opción simple:
1. Abrí `index.html` en el navegador

Opción recomendada:
1. Abrí una terminal en esta carpeta
2. Ejecutá:
   - `python -m http.server 5500`
3. Entrá a:
   - `http://localhost:5500`

## Deploy en Vercel

### Opción 1: desde la web de Vercel
1. Creá un repositorio en GitHub y subí esta carpeta
2. Entrá a Vercel
3. Importá el repositorio
4. Deploy

### Opción 2: con Vercel CLI
1. Instalá la CLI:
   - `npm i -g vercel`
2. En la carpeta del proyecto ejecutá:
   - `vercel`
3. Para producción:
   - `vercel --prod`

## Personalizaciones posibles

- Cambiar colores y branding
- Agregar más gráficos
- Convertirlo a React o Next.js
- Leer nuevos Excel automáticamente
- Publicar con dominio propio
