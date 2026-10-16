# Family Bank — instrucciones para Codex

## Objetivo del proyecto

Aplicación web familiar, pensada principalmente para móvil, para llevar el efectivo y las inversiones de varios miembros de una familia. La interfaz está en español y se llama **Family Bank**.

## Tecnologías y comandos

- Next.js 15 con App Router, React 19 y TypeScript.
- MUI para componentes e iconos; estilos globales en `app/globals.css`.
- SQLite local con `better-sqlite3`; la base se crea en `data/family-bank.sqlite` al importar `lib/db.ts`.
- `npm run dev`: servidor de desarrollo.
- `npm run build`: compilación de producción.
- `npm start`: sirve la compilación.

Ejecuta los comandos desde `family-bank/`. No guardes la base SQLite ni credenciales en Git.

## Modelo y comportamiento actual

- `users`: credenciales de acceso. No hay credenciales predeterminadas; el usuario inicial se crea con `ADMIN_USERNAME` y `ADMIN_PASSWORD`.
- `members`: miembros con nombre, avatar, saldo efectivo y saldo inversión. Admin puede añadir niños desde Perfiles; una instalación nueva empieza sin miembros.
- `tasks`: tareas guardadas con nombre, descripción, valor en céntimos e icono.
- `transactions`: historial de tareas acreditadas e inversiones.
- Las tareas acreditan efectivo tras introducir el PIN configurado en `PARENT_PIN` (o el que establezca la familia).
- Una tarea personalizada se puede guardar para reutilizarla o usar solo una vez.
- Invertir mueve efectivo a inversión y duplica el importe invertido.
- La pantalla de cuenta tiene rutas directas `/accounts/[name]`.
- La navegación atrás debe mantener el contenido sincronizado con la URL. Evita reactivar cuentas desde cierres asíncronos o estados antiguos.
- Los diálogos usan el centrado predeterminado de MUI. No aplicar posicionamiento inferior personalizado a `Dialog`.

## Organización del código

- `app/page.tsx`: flujo de inicio de sesión, listado y detalle de cuentas, tareas y diálogos.
- `app/accounts/[name]/page.tsx`: ruta dinámica para enlaces directos a cuentas.
- `app/api/`: endpoints para sesión, miembros, tareas, inversiones e historial.
- `middleware.ts`: exige sesión para las rutas de API salvo los endpoints de inicio de sesión, despliegue y salud.
- `lib/db.ts`: inicialización del esquema y de los datos iniciales.
- `app/globals.css`: diseño visual y adaptación móvil.

## Guía de cambios

- Mantén una experiencia móvil, accesible y en español.
- Guarda importes en SQLite como enteros de céntimos; convierte a euros solo para mostrar o recibir valores de formularios.
- Usa transacciones SQLite para operaciones que actualicen saldos e historial conjuntamente.
- Al añadir endpoints de datos, conserva la protección de sesión existente.
- Al cambiar el flujo de navegación, conserva URL, estado visible y comportamiento de atrás/adelante del navegador.
- No cambies la semántica de duplicación de inversión ni el PIN familiar configurado sin petición explícita.
- No incluyas secretos, contraseñas reales ni archivos de `data/` en el control de versiones. Configura `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `PARENT_PIN` fuera del repositorio.

## Continuación recomendada

Lee este archivo y revisa el estado actual del proyecto antes de editarlo. Para comprobar cambios de compilación, ejecuta `npm run build`. Ten en cuenta que Next.js puede advertir que detecta el `bun.lock` de la carpeta padre; ese aviso no necesariamente impide compilar.
