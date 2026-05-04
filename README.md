# TicoAuto - Backend REST

API REST del marketplace de vehículos TicoAuto. Maneja autenticación, registro de usuarios, gestión de vehículos, preguntas/respuestas y subida de imágenes.

## Tecnologías

- Node.js + Express
- MongoDB (Mongoose)
- JWT para autenticación
- bcrypt para encriptar contraseñas
- Twilio (SMS para 2FA)
- SendGrid (verificación de correo)
- Passport (login con Google)
- Multer (subida de imágenes)

## Requisitos previos

- Node.js v18 o superior
- Una base de datos MongoDB (local o Atlas)
- Tener corriendo el API del Padrón (puerto 8000)

## Instalación

```bash
git clone <url-del-repo>
cd ISW-711-Proyecto2-TicoAuto-Server-Rest
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con:

```env
DATABASE_URL=mongodb+srv://usuario:password@cluster.mongodb.net/basedatos
JWT_SECRET=tu_secreto_jwt
SESSION_SECRET=tu_secreto_session
FRONTEND_URL=http://127.0.0.1:5500/ISW-711-Proyecto2-TicoAuto-Client

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret

# SendGrid (correos)
EMAIL_USER=tu_correo@gmail.com
SENDGRID_API_KEY=tu_api_key

# Twilio (SMS para 2FA)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
TWILIO_TEST_MODE=true
TWILIO_TEST_PHONE_NUMBER=+506xxxxxxxx
```

Cambia `TWILIO_TEST_MODE=false` en producción para que los SMS vayan al teléfono real del usuario.

## Cómo correrlo

```bash
npm run dev
El servidor arranca en `http://localhost:3008`.
```

## Endpoints principales

- `POST /auth/token` - Login (devuelve requires2FA)
- `POST /auth/2fa` - Verificar código 2FA
- `GET /auth/google` - Login con Google
- `POST /api/users` - Registrar usuario
- `GET /api/users/cedula/:cedula` - Validar cédula con Padrón
- `GET /api/vehicles` - Listar vehículos
- `POST /api/vehicles` - Crear vehículo
- `PATCH /api/vehicles/:id` - Editar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo
- `POST /api/vehicles/:vehicleId/questions` - Preguntar
- `POST /api/vehicles/:vehicleId/questions` - Listar preguntas
- `POST /api/questions/:questionId/answers` - Responder