# 🚀 Guía de Deployment a Render

Esta guía te ayudará a desplegar tu Sistema de Ponche en internet usando Render y GitHub.

## 📋 Prerrequisitos

1. Cuenta de GitHub (gratis)
2. Cuenta de Render (gratis) - [render.com](https://render.com)
3. Git instalado en tu computadora

## 🔧 Cambios Realizados en el Código

### ✅ Backend
- ✅ Migración de `data.json` a PostgreSQL
- ✅ Configuración de variables de entorno
- ✅ Actualización de CORS para producción
- ✅ Agregado de dependencias: `pg` y `dotenv`

### ✅ Frontend
- ✅ Configuración de API URL dinámica
- ✅ Variables de entorno con Vite

### ✅ Archivos de Configuración
- ✅ `.env.example` para backend y frontend
- ✅ `render.yaml` para deployment automático
- ✅ `.gitignore` actualizado

---

## 📦 Paso 1: Subir el Código a GitHub

### 1.1 Inicializar Git (si no lo has hecho)
```bash
cd "/Users/ing.carlosjimenez/Library/Mobile Documents/com~apple~CloudDocs/Proyectos/sistemas-ponche"
git init
```

### 1.2 Configurar tu usuario de Git
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### 1.3 Agregar archivos y hacer commit
```bash
git add .
git commit -m "Preparar proyecto para deployment en Render"
```

### 1.4 Crear repositorio en GitHub
1. Ve a [github.com](https://github.com)
2. Inicia sesión
3. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
4. Nombre del repositorio: `sistema-ponche` (o el que prefieras)
5. Deja el repositorio como **Público**
6. **NO** marques "Initialize with README"
7. Haz clic en **"Create repository"**

### 1.5 Conectar y subir el código
```bash
git remote add origin https://github.com/TU-USUARIO/sistema-ponche.git
git branch -M main
git push -u origin main
```

---

## 🌐 Paso 2: Desplegar en Render

### 2.1 Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Haz clic en **"Get Started"**
3. Regístrate con tu cuenta de GitHub (recomendado)
4. Autoriza a Render a acceder a tus repositorios

### 2.2 Crear la Base de Datos PostgreSQL

1. En el Dashboard de Render, haz clic en **"New +"** → **"PostgreSQL"**
2. Configuración:
   - **Name**: `ponche-db`
   - **Database**: `ponche`
   - **User**: `ponche_user`
   - **Region**: Oregon (o el más cercano)
   - **Plan**: **Free**
3. Haz clic en **"Create Database"**
4. **Espera 2-3 minutos** hasta que diga "Available"
5. Copia la **"Internal Database URL"** (la necesitarás después)

### 2.3 Desplegar el Backend

1. Haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio `sistema-ponche`
3. Configuración:
   - **Name**: `ponche-backend`
   - **Region**: Oregon (mismo que la base de datos)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

4. **Variables de Entorno** (Click en "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV = production
   PORT = 10000
   DATABASE_URL = [Pega aquí la Internal Database URL de tu PostgreSQL]
   JWT_SECRET = tu_clave_super_secreta_cambia_esto_por_algo_aleatorio_123456
   FRONTEND_URL = https://ponche-frontend.onrender.com
   ```

5. Haz clic en **"Create Web Service"**
6. **Espera 5-10 minutos** para que se despliegue
7. Una vez desplegado, copia tu URL del backend (algo como: `https://ponche-backend-xxxx.onrender.com`)

### 2.4 Desplegar el Frontend

1. Haz clic en **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio `sistema-ponche`
3. Configuración:
   - **Name**: `ponche-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Variables de Entorno**:
   ```
   VITE_API_URL = [Pega aquí la URL de tu backend]/api
   ```
   Ejemplo: `https://ponche-backend-xxxx.onrender.com/api`

5. Haz clic en **"Create Static Site"**
6. **Espera 5-10 minutos** para que se despliegue

### 2.5 Actualizar la URL del Frontend en el Backend

1. Ve a tu servicio de **backend** en Render
2. En el menú izquierdo, haz clic en **"Environment"**
3. Edita la variable `FRONTEND_URL` con la URL real de tu frontend
4. Ejemplo: `https://ponche-frontend-xxxx.onrender.com`
5. Guarda los cambios (el backend se reiniciará automáticamente)

---

## ✅ Paso 3: Verificar el Deployment

### 3.1 Verificar el Backend
1. Abre tu URL del backend + `/api/health`
2. Ejemplo: `https://ponche-backend-xxxx.onrender.com/api/health`
3. Deberías ver: `{"status":"OK","message":"Sistema de ponche funcionando"}`

### 3.2 Verificar el Frontend
1. Abre la URL de tu frontend
2. Ejemplo: `https://ponche-frontend-xxxx.onrender.com`
3. Deberías ver la página de login

### 3.3 Probar el Login
- **Usuario**: `admin`
- **Contraseña**: `admin123`

---

## 🎉 ¡Listo!

Tu sistema ya está en internet y puedes accederlo desde cualquier computador.

### 📱 URLs Importantes:
- **Frontend**: Tu URL de Render del frontend
- **Backend API**: Tu URL de Render del backend
- **Repositorio GitHub**: https://github.com/TU-USUARIO/sistema-ponche

---

## ⚠️ Notas Importantes

### Plan Gratuito de Render:
- ⏱️ Los servicios gratuitos se "duermen" después de 15 minutos de inactividad
- 🐌 La primera carga después de estar dormido puede tardar 30-60 segundos
- 💾 Base de datos: 1GB de almacenamiento
- 📊 500 horas de servidor gratis al mes (suficiente para uso moderado)

### Seguridad:
- 🔐 Cambia la contraseña del admin después del primer login
- 🔑 Usa un JWT_SECRET fuerte y único
- 🚫 Nunca compartas tus archivos `.env`

---

## 🔄 Actualizar el Código

Cada vez que hagas cambios en tu código local:

```bash
# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main
```

**Render automáticamente detectará los cambios y re-desplegará tu aplicación** 🎉

---

## 🆘 Solución de Problemas

### El backend no inicia:
1. Verifica que la variable `DATABASE_URL` esté correcta
2. Revisa los logs en Render (pestaña "Logs")

### El frontend no conecta con el backend:
1. Verifica que `VITE_API_URL` tenga la URL correcta del backend
2. Verifica que `FRONTEND_URL` en el backend tenga la URL correcta del frontend
3. Asegúrate de que el backend esté corriendo (visible en verde en Render)

### Error de CORS:
- Verifica que `FRONTEND_URL` en las variables de entorno del backend sea exactamente la URL de tu frontend (sin `/` al final)

---

## 💡 Próximos Pasos

- [ ] Cambiar la contraseña del admin
- [ ] Agregar empleados de prueba
- [ ] Probar el sistema de ponche
- [ ] Compartir la URL con tu equipo

---

## 📞 Soporte

Si tienes problemas, puedes:
1. Revisar los logs en Render (pestaña "Logs" de cada servicio)
2. Verificar que todas las variables de entorno estén correctas
3. Asegurarte de que el backend esté "Available" antes de usar el frontend

---

**¡Felicidades por tu deployment! 🎉**
