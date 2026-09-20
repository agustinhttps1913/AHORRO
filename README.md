# AHORRO / FlowMoney

App de ahorro en React, publicada en GitHub Pages, con cuentas privadas en Supabase.

## Configuración

1. Proyecto Supabase Free creado: AHORRO (`fjupkzmaclnxlnmijhyt`), región São Paulo.
2. El esquema `supabase/schema.sql` ya fue aplicado al proyecto mediante la migración `private_finance_accounts`. No volver a ejecutarlo allí.
3. Habilitar email/contraseña en Auth. Configurar Site URL y Redirect URLs con `https://agustinhttps1913.github.io/AHORRO/`.
4. Configurar el envío de confirmaciones de correo antes de habilitar el registro público. El servicio de correo de prueba de Supabase tiene restricciones; no desactivar la confirmación sin evaluar el cambio.
5. `.env.production` contiene la URL del proyecto y su clave pública publicable. No contiene claves administrativas.
6. Publicar con el workflow de GitHub Pages, que usa esa configuración pública.

Cada persona crea una cuenta diferente dentro de AHORRO. La cuenta del panel de Supabase no es una cuenta de la aplicación.

## Desarrollo y verificación

Node.js 22 o superior. Copiar `.env.example` a `.env.local` y completar las dos variables públicas.

```sh
npm ci
npm run dev
npm test
npm run build
```

## Privacidad y guardado

Una fila JSON por usuario conserva el modelo actual: cuentas, movimientos, presupuestos, metas, planificación y ajustes. RLS restringe lecturas, inserciones y actualizaciones al dueño. La función de guardado se ejecuta con los permisos del usuario y verifica su identidad y revisión. Dos dispositivos no pueden reemplazar silenciosamente versiones más recientes usando la función.

Las escrituras se envían en orden. La interfaz muestra cuándo termina el guardado. Ante un error, bloquea nuevas ediciones y ofrece descargar los cambios. Una copia pendiente por usuario permite recuperar cambios tras recargar, si el navegador permite almacenamiento local. No reemplaza una copia de seguridad externa. Para ver nuevos cambios de otro dispositivo, recargar la página.

## Recuperar datos anteriores

Los datos antiguos de IndexedDB/localStorage no se borran ni se asignan automáticamente a una cuenta. En Configuración, importar el respaldo JSON y esperar «Guardado en la nube». La importación pide confirmación porque reemplaza el contenido actual de esa cuenta.

El plan gratuito puede pausarse por inactividad y no incluye copias automáticas. Conservar respaldos JSON periódicos.

## Pendiente antes de publicar

El proyecto real y su esquema están creados. Se verificó RLS, las tres políticas de propiedad y el bloqueo de acceso anónimo; los asesores de seguridad no informaron hallazgos. Falta configurar Auth/correo, publicar en GitHub (la integración rechaza escrituras con 403) y comprobar registro, acceso, guardado y recuperación con dos usuarios en el entorno conectado. Las pruebas locales de base de datos usan PostgreSQL en PGlite; no sustituyen la verificación del proyecto real.
