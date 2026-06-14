# Tienda de Perritos - Frontend (AWS ECS Fargate)

Este repositorio contiene la capa de interfaz de usuario de la aplicacion Tienda de Perritos.

## Descripcion del Proyecto
La interfaz esta contenerizada y desplegada en Amazon ECS (Fargate). Se utiliza un servidor Nginx configurado como Reverse Proxy para la gestion eficiente de las peticiones hacia la API del backend.

## Detalles Tecnicos
- Lenguaje: HTML5, CSS3, JavaScript.
- Servidor Web: Nginx sobre Alpine Linux.
- Orquestacion: AWS ECS (Fargate).
- Seguridad: Comunicacion interna mediante IPs privadas dentro de la VPC.

## Automatizacion (CI/CD)
El despliegue se realiza de forma automatica mediante GitHub Actions. El pipeline asegura que la ultima version del codigo este siempre disponible en el registro de Amazon ECR y desplegada en el cluster.

### Ejecucion Manual del Pipeline
Para iniciar un despliegue manualmente (util para actualizaciones de credenciales):
1. Navegar a la seccion "Actions".
2. Seleccionar el workflow "CI/CD Tienda Perritos - Frontend (ECS)".
3. Presionar "Run workflow".

---
Desarrollado por Jorge Vergara - Evaluacion Parcial N°3 - Ingenieria DevOps.
