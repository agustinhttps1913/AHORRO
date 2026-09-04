# FlowMoney Personal

FlowMoney Personal es una aplicación de finanzas personales pensada para una sola persona y preparada para publicarse gratis en GitHub Pages.

## Privacidad

Esta versión no usa Supabase, backend, login ni base de datos online.

- GitHub Pages aloja solamente los archivos de la aplicación.
- Los movimientos, cuentas, presupuestos, objetivos y configuración se guardan localmente en el navegador mediante IndexedDB.
- No se envían datos financieros a GitHub ni a otro servidor.
- Los datos no se sincronizan entre dispositivos.

> Importante: si borrás los datos del navegador, cambiás de navegador o cambiás de dispositivo, necesitás un backup para recuperar la información.

## Funciones incluidas

- Dashboard financiero
- Ingresos, gastos, ahorros y transferencias
- Cuentas
- Calendario financiero
- Planificación mensual
- Presupuestos
- Ahorros
- Objetivos
- Gastos recurrentes
- Análisis y gráficos
- Modo claro / oscuro
- Diseño responsive para PC y celular
- Backup completo en JSON
- Restauración desde JSON
- Exportación de movimientos a CSV
- Datos demo opcionales
- Deploy automático a GitHub Pages

## Ejecutar localmente

Necesitás Node.js 22 o compatible.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

## Compilar

```bash
npm run build
```

La versión final queda en `dist/`.

## Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub.
2. Subí todos los archivos de este proyecto.
3. Asegurate de que la rama principal se llame `main`.
4. En GitHub abrí `Settings > Pages`.
5. En `Build and deployment`, elegí `GitHub Actions`.
6. Hacé un push a `main`.
7. El workflow `.github/workflows/deploy.yml` instala dependencias, compila y publica la app.

No necesitás Secrets, Variables, Supabase ni archivos `.env`.

## Navegación en GitHub Pages

La app usa `HashRouter`, por lo que las rutas se ven así:

- `/#/`
- `/#/calendario`
- `/#/movimientos`
- `/#/objetivos`

Esto evita errores 404 al recargar una ruta en GitHub Pages.

## Copias de seguridad

En `Configuración > Datos locales` podés:

- Exportar un backup completo JSON.
- Importar un backup JSON.
- Exportar los movimientos en CSV.
- Borrar todos los datos locales.

Conviene guardar periódicamente el JSON fuera del navegador, por ejemplo en Drive, un pendrive o tu PC.

## Almacenamiento

FlowMoney intenta usar IndexedDB. Si el navegador no lo permite, usa `localStorage` como respaldo técnico.

## Estructura

```text
src/
  components/
  context/
  lib/
  pages/
  types/
  utils/
.github/
  workflows/
    deploy.yml
```

## Nota sobre múltiples dispositivos

Esta edición está hecha deliberadamente para uso personal y local. Los datos cargados en una PC no aparecerán automáticamente en el celular. Para pasar la información, exportá el backup JSON e importalo en el otro dispositivo.

## Si GitHub Pages aparece en blanco

GitHub Pages debe publicar el resultado compilado por GitHub Actions, no los archivos fuente del repositorio.

1. Abrí `Settings > Pages`.
2. En `Build and deployment > Source`, elegí **GitHub Actions**.
3. Abrí la pestaña `Actions` del repositorio.
4. El workflow **Deploy FlowMoney Personal to GitHub Pages** debe terminar en verde.
5. Cuando termine, recargá la URL de Pages con `Ctrl + F5`.

Si se usa `Deploy from a branch`, `index.html` intenta cargar archivos TypeScript de desarrollo y la aplicación no funcionará correctamente en producción.
