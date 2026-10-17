# Banky

Aplicación familiar para administrar el efectivo, las tareas y las metas de inversión de sus miembros. La interfaz está en español y se adapta a móvil.

## Desarrollo local

Requiere Node.js 22 y npm. Define secretos locales antes de iniciar la app; la base se crea en `data/family-bank.sqlite` y no se versiona.

```sh
export SESSION_SECRET="$(openssl rand -hex 32)"
export ADMIN_USERNAME="familia"
export ADMIN_PASSWORD="SUSTITUYE_POR_UNA_CONTRASENA_SEGURA"
export PARENT_PIN="SUSTITUYE_POR_4_CIFRAS"
npm ci
npm run dev
```

`SESSION_SECRET` debe tener al menos 32 caracteres y mantenerse estable entre reinicios. Puedes guardar estas variables en `.env.local`, que está excluido de Git y Docker. `DATA_DIR` permite usar otra carpeta para la base de datos.

`ADMIN_USERNAME`, `ADMIN_PASSWORD` y `PARENT_PIN` solo aprovisionan datos iniciales; no cambian las credenciales de una base existente. La contraseña y el PIN se pueden cambiar desde Administración. Las instalaciones nuevas empiezan sin niños: entra en Ajustes de padres → Perfiles → Añadir miembro para crear cada cuenta con nombre, edad opcional y avatar. Cada miembro empieza con saldo cero y una meta de ahorro.

## Formato del código

El proyecto usa Prettier con una configuración compartida en `.prettierrc.json`.

```sh
npm run format        # Formatea el código y los archivos de configuración
npm run format:check  # Comprueba el formato sin modificar archivos
```

Los archivos generados, las bases de datos y las variables de entorno quedan excluidos mediante `.prettierignore`.

## Imagen Docker y despliegue

Las claves del servidor (`SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `PARENT_PIN` y `DEPLOY_WEBHOOK_TOKEN`) se configuran al ejecutar el contenedor, mediante un Secret de Kubernetes o variables de entorno. Puedes prepararlas en un archivo local `.env.production`, excluido de Git y Docker. No deben usarse como argumentos de build: una imagen distribuida no debe contener contraseñas ni tokens.

El workflow `.github/workflows/publish.yml` publica la imagen en GitHub Container Registry con etiquetas `latest` y SHA del commit. Las publicaciones automáticas se ejecutan desde `main` o `master`.

Para activar el despliegue desde GitHub Actions, configura:

- El secreto `FAMILY_BANK_DEPLOY_TOKEN`, con el mismo valor que `DEPLOY_WEBHOOK_TOKEN` en el servidor.
- La variable `FAMILY_BANK_DEPLOY_URL`, con la URL HTTPS completa del endpoint `/api/deploy`.

Sin el secreto, el workflow solo publica la imagen. En una ejecución manual también puedes desactivar `deploy` para publicar la primera imagen antes de instalar la aplicación.

El endpoint acepta únicamente imágenes por digest SHA-256 del paquete de este repositorio. El pod necesita `POD_NAMESPACE`, acceso a la API de Kubernetes con su certificado CA y un ServiceAccount con permisos `get` y `patch` sobre el Deployment `family-bank`. El workflow consulta el estado hasta confirmar que la nueva imagen está disponible.

Los manifiestos y las instrucciones específicos del clúster se mantienen localmente en `k8s/`, excluido de Git y del contexto de Docker. No se distribuyen con el repositorio público.
