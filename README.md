# Pokeneas

Taller 02 de Arquitectura de Software (EAFIT). Los **Pokeneas** son pokémon nacidos en Antioquia.
Es una aplicación web en **Node.js + Express**, sin base de datos: los pokeneas viven en un arreglo
quemado en el código. Se publica como imagen en Docker Hub con GitHub Actions y se despliega en
Docker Swarm.

## Funcionalidades

| Ruta            | Descripción                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------- |
| `GET /`         | Página de inicio con enlaces a las demás rutas.                                               |
| `GET /api/pokenea` | JSON con un pokenea **aleatorio**: `id`, `nombre`, `altura`, `habilidad` y el `containerId`. |
| `GET /pokenea`  | Vista HTML con la imagen, la frase filosófica de un pokenea aleatorio y el `containerId`.      |

El `containerId` es el `hostname` de la máquina (`os.hostname()`). Dentro de Docker corresponde al id
del contenedor, así que al refrescar la página se ve qué réplica del servicio respondió.

Ejemplo de respuesta de `/api/pokenea`:

```json
{
  "id": 1,
  "nombre": "Paisachu",
  "altura": 0.4,
  "habilidad": "Echar cuento",
  "containerId": "3f2a9c1b7d4e"
}
```

## Modelo de datos

Cada pokenea tiene esta forma (en `src/data/pokeneas.js`):

```js
{
  id: 1,
  nombre: 'Paisachu',
  altura: 0.4,
  habilidad: 'Echar cuento',
  imagen: 'paisachu.png',          // solo el nombre del archivo en el bucket
  fraseFilosofica: 'El que nada debe, nada teme... pero igual pide la cuenta.',
}
```

Las imágenes están en un bucket de **Google Cloud Storage**. La URL completa se arma como
`IMAGES_BASE_URL + "/" + imagen`.

## Arquitectura

Para no dejar todo en un solo archivo, el código está separado por capas. Cada capa solo usa la
siguiente:

```
rutas  →  controladores  →  servicios  →  datos
```

```
src/
├── server.js                    Punto de entrada: arranca el servidor (listen)
├── app.js                       Crea y configura Express y monta las rutas
├── config/
│   └── index.js                 Configuración desde variables de entorno
├── data/
│   └── pokeneas.js              Arreglo de pokeneas
├── services/
│   └── pokeneaService.js        getRandom(), toPublicJson(p), getImageUrl(p)
├── utils/
│   └── container.js             getContainerId() con os.hostname()
├── controllers/
│   └── apiController.js         Arma la respuesta JSON
├── routes/
│   ├── index.js                 Router principal: "/", "/api" y "/pokenea"
│   └── apiRoutes.js             GET /api/pokenea
└── views/                       Vistas HTML
```

- **`app.js` y `server.js` están separados** para poder importar la app sin abrir el puerto, por
  ejemplo en pruebas.
- **`toPublicJson`** expone solo los campos públicos. Por eso la ruta JSON no devuelve la imagen ni
  la frase.

## Variables de entorno

| Variable          | Por defecto                                       | Descripción                                    |
| ----------------- | ------------------------------------------------- | ---------------------------------------------- |
| `PORT`            | `80`                                              | Puerto en el que escucha la app.               |
| `IMAGES_BASE_URL` | `https://storage.googleapis.com/pokeneas-images`  | URL base del bucket (se le quita el `/` final). |

## Ejecución local

Requisitos: Node.js LTS y npm.

```bash
npm install
PORT=3000 npm start
```

Después abre <http://localhost:3000>. Sin `PORT`, la app usa el puerto 80, que en macOS y Linux puede
requerir permisos de administrador.

## Docker

```bash
docker build -t davidfra2/pokeneas:latest .
docker run -p 80:80 -e IMAGES_BASE_URL=https://storage.googleapis.com/mi-bucket davidfra2/pokeneas:latest
```

La imagen usa `node:lts-alpine` e instala solo las dependencias de producción (`npm ci --omit=dev`).

## Integración continua (GitHub Actions)

El workflow `.github/workflows/docker-image.yml` corre en cada `push` y `pull_request` a `main`:

1. Hace checkout del código.
2. Construye la imagen `<DOCKERHUB_USER>/pokeneas:latest`.
3. **Solo en `push`:** inicia sesión en Docker Hub y publica la imagen.

Secrets que deben estar configurados en el repositorio (*Settings → Secrets and variables → Actions*):

- `DOCKERHUB_USER`: usuario de Docker Hub.
- `DOCKERHUB_PASS`: contraseña o *access token* de Docker Hub.

## Despliegue en GCP con Docker Swarm

Cada integrante despliega en **su propia cuenta de GCP**. Los dos usan la misma imagen
`davidfra2/pokeneas` de Docker Hub, y cada uno indica la URL de su bucket con `IMAGES_BASE_URL`.

### 1. Bucket de imágenes (Cloud Storage)

1. En *Cloud Storage → Buckets*, crea un bucket (por ejemplo `pokeneas-<usuario>`).
2. Dale acceso público de lectura: en *Permissions → Grant access*, agrega el principal `allUsers`
   con el rol *Storage Object Viewer*.
3. Sube las imágenes con los mismos nombres que tienen en el campo `imagen` de `src/data/pokeneas.js`.

La URL base del bucket queda así: `https://storage.googleapis.com/<nombre-del-bucket>`.

Con `gcloud`, lo mismo se hace así:

```bash
gcloud storage buckets create gs://<nombre-del-bucket> --uniform-bucket-level-access
gcloud storage buckets add-iam-policy-binding gs://<nombre-del-bucket> \
  --member=allUsers --role=roles/storage.objectViewer
gcloud storage cp <carpeta-imagenes>/*.png gs://<nombre-del-bucket>/
```

### 2. Instance template con Docker

En *Compute Engine → Instance templates → Create instance template*:

- **Tipo de máquina:** `e2-micro`.
- **Sistema operativo:** Debian 13 Trixie.
- **Firewall:** activa *Allow HTTP traffic* y *Allow HTTPS traffic*.
- **Startup script** (en *Advanced options → Management → Automation*): pega el script del Tutorial 07,
  que instala Docker Engine.

### 3. Grupo de 4 instancias

1. Desde el template, entra a *Create instance group*.
2. En *Number of instances* pon **4** y en *Location* elige *Single zone*.
3. En *Autoscaling* elige *Off: do not autoscale*.

Espera unos 5 minutos. Luego, por SSH, verifica en cada instancia que Docker quedó instalado:

```bash
docker -v
```

### 4. Crear el Swarm (1 líder + 3 managers)

En la instancia **líder** (nodo-01):

```bash
sudo docker swarm init
sudo docker swarm join-token manager   # copia el comando "docker swarm join --token ..."
```

En cada una de las **otras 3 instancias**, ejecuta el comando copiado con `sudo` adelante:

```bash
sudo docker swarm join --token <token-manager> <ip-interna-lider>:2377
```

Verifica desde el líder que los 4 nodos aparecen y que el estado de cada uno es *Leader* o *Reachable*:

```bash
sudo docker node ls
```

### 5. Crear el servicio con 10 réplicas

Desde el líder:

```bash
sudo docker service create \
  --name pokeneas \
  --replicas 10 \
  -p 80:80 \
  -e IMAGES_BASE_URL=https://storage.googleapis.com/<nombre-del-bucket> \
  davidfra2/pokeneas:latest
```

### 6. Verificación

```bash
sudo docker service ls             # debe mostrar 10/10
sudo docker service ps pokeneas    # las 10 réplicas y el nodo donde corre cada una
sudo docker container ls           # contenedores del nodo actual
```

Abre `http://<IP-externa-de-cualquier-nodo>/api/pokenea` y `http://<IP-externa>/pokenea`. Recarga cada
pocos segundos (o abre una ventana de incógnito): el `containerId` debe cambiar, porque Swarm reparte
las peticiones entre las réplicas de los 4 nodos.

### Comandos útiles

```bash
sudo docker service update --image davidfra2/pokeneas:latest pokeneas   # actualizar a la última imagen
sudo docker service scale pokeneas=10
sudo docker service logs pokeneas
sudo docker service rm pokeneas
```

Después de la sustentación, borra el instance group para no gastar créditos.

## Equipo

- **David Ríos**: base del proyecto (arquitectura, ruta JSON, Docker, CI y README).
- **Gisel**: datos finales de los pokeneas y vista `/pokenea`.
