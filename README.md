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

## Despliegue en Docker Swarm

En el nodo manager:

```bash
docker swarm init
docker service create \
  --name pokeneas \
  --replicas 3 \
  -p 80:80 \
  -e IMAGES_BASE_URL=https://storage.googleapis.com/mi-bucket \
  davidfra2/pokeneas:latest
```

Para unir más nodos, ejecuta en cada uno el comando `docker swarm join ...` que imprime `swarm init`.
Al refrescar `/api/pokenea` o `/pokenea`, el `containerId` cambia según la réplica que atiende.

Comandos útiles:

```bash
docker service ls
docker service ps pokeneas
docker service update --image davidfra2/pokeneas:latest pokeneas   # actualizar a la última imagen
docker service scale pokeneas=5
```

## Equipo

- **David Ríos**: base del proyecto (arquitectura, ruta JSON, Docker, CI y README).
- **Gisel**: datos finales de los pokeneas y vista `/pokenea`.
