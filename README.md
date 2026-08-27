# RIU Frontend - Superheroes

Aplicación desarrollada como prueba técnica para la gestión de superhéroes. Desarrollada con Angular 21.2.21.

Permite listar, buscar, crear, editar y eliminar héroes utilizando una API mock con JSON Server.
## Tecnologías

- Angular 21
- TypeScript
- Angular Material
- Tailwind CSS
- RxJS
- Signals
- Vitest
- JSON Server
- Docker
- Nginx

## Requisitos

Para ejecutar el proyecto localmente:

- Node.js 22
- npm

Para ejecutarlo con Docker:

- Docker / Docker Desktop

## Desarrollo

Instalar las dependencias:

```bash
npm install 
```

Levantar API mock:

```bash
npm run api
```

Levantar el servidor de desarrollo:

```bash
npm run start
```

La aplicación se ejecutará en `http://localhost:4200/`.

La API mock se ejecutará en `http://localhost:3000/`.

### Docker
La aplicación también puede ejecutarse completamente con Docker:

```bash
docker-compose up --build
```

La aplicación se ejecutará en `http://localhost:8080/`.

Docker compose levanta:
-  Angular compilado y servido por Nginx
-  API mock con JSON Server
- Nginx utiliza `/api` como reverse proxy hacia JSON Server

### Testing
Ejecutar los tests unitarios:

```bash
npm run test
```

Ejecutar los test con coverage:

```bash
npm run test:coverage
```

### Funcionalidades

- Listado de héroes
- Búsqueda por nombre
- Paginación
- Alta de héroes
- Edición de héroes
- Eliminación con confirmación
- Formulario con validación
- Directiva para transformar el nombre del héroe en mayúsculas
- Indicador global de loading para operaciones de escritura
- Manejo de estados de carga y error
- API mock con JSON Server
