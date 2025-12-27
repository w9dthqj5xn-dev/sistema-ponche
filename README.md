# 🕐 Sistema de Ponche Empresarial

Sistema completo de gestión de ponches (entrada/salida) para empresas con múltiples tiendas y empleados.

## 📋 Características

### Panel Administrativo
- **Dashboard** con estadísticas en tiempo real
- **Gestión de Empleados**: Crear, editar, eliminar empleados
- **Gestión de Tiendas**: 4 tiendas pre-registradas con opción de agregar más
- **Visualización de Ponches**: Ver todos los ponches filtrados por fecha, tienda y empleado
- **Renombrar empleados** con nombres personales

### Panel de Empleados
- **Registro de Ponches**: Botones de entrada y salida
- **Historial Personal**: Ver ponches organizados por día
- **Confirmación Visual**: Mensaje de éxito al registrar ponche

## 🚀 Instalación y Configuración

### Backend

```bash
cd backend
npm install
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔑 Credenciales de Acceso

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Empleados
Los empleados usan su código de empleado como usuario y contraseña inicial.

## 📦 Estructura del Proyecto

```
sistemas-ponche/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js         # Base de datos JSON
│   │   ├── middleware/
│   │   │   └── auth.js             # Autenticación JWT
│   │   ├── routes/
│   │   │   ├── auth.js             # Rutas de autenticación
│   │   │   ├── employees.js        # Rutas de empleados
│   │   │   ├── punches.js          # Rutas de ponches
│   │   │   └── stores.js           # Rutas de tiendas
│   │   └── server.js               # Servidor Express
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── admin/
    │   │       ├── Dashboard.jsx   # Dashboard admin
    │   │       ├── Employees.jsx   # Gestión empleados
    │   │       ├── Stores.jsx      # Gestión tiendas
    │   │       └── Punches.jsx     # Vista ponches
    │   ├── pages/
    │   │   ├── Login.jsx           # Página de login
    │   │   ├── AdminDashboard.jsx  # Layout admin
    │   │   └── EmployeeDashboard.jsx # Dashboard empleado
    │   ├── services/
    │   │   └── api.js              # Cliente API
    │   ├── styles/
    │   │   ├── Login.css
    │   │   ├── AdminDashboard.css
    │   │   └── EmployeeDashboard.css
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- JSON Web Tokens (JWT) para autenticación
- bcryptjs para encriptación de contraseñas
- Base de datos JSON (fácil migración a SQL)

### Frontend
- React 19
- React Router para navegación
- CSS moderno con gradientes y animaciones
- Diseño responsive

## 📊 Funcionalidades Detalladas

### Administrador
1. **Dashboard**
   - Estadísticas generales (empleados, tiendas, ponches)
   - Estadísticas por tienda
   - Últimos ponches registrados

2. **Empleados**
   - Crear nuevos empleados con código único
   - Asignar a tiendas específicas
   - Editar información (nombre, puesto, teléfono, email)
   - Activar/desactivar empleados
   - Eliminar empleados

3. **Tiendas**
   - 4 tiendas iniciales: Centro, Norte, Sur, Este
   - Crear nuevas tiendas
   - Editar nombre y dirección
   - Ver cantidad de empleados por tienda

4. **Ponches**
   - Filtrar por fecha, tienda y tipo
   - Ver ponches agrupados por empleado
   - Estadísticas de entradas y salidas

### Empleado
1. **Registrar Ponche**
   - Botón grande de Entrada (verde)
   - Botón grande de Salida (naranja)
   - Confirmación visual con hora exacta

2. **Historial**
   - Ver ponches del día actual
   - Filtrar por fecha
   - Ponches agrupados por día
   - Indicador visual de entrada/salida

## 🔐 Seguridad

- Autenticación JWT
- Contraseñas encriptadas con bcryptjs
- Middleware de autorización
- Validación de roles (admin/employee)
- Tokens con expiración de 8 horas

## 🎨 Diseño

- Interfaz moderna con gradientes
- Iconos emoji para mejor UX
- Animaciones suaves
- Diseño responsive para móvil y desktop
- Código de colores para diferentes tipos de ponches

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Empleados
- `GET /api/employees` - Obtener todos (admin)
- `GET /api/employees/:id` - Obtener uno
- `GET /api/employees/store/:storeId` - Por tienda
- `POST /api/employees` - Crear (admin)
- `PUT /api/employees/:id` - Actualizar (admin)
- `DELETE /api/employees/:id` - Eliminar (admin)

### Tiendas
- `GET /api/stores` - Obtener todas
- `GET /api/stores/:id` - Obtener una
- `POST /api/stores` - Crear (admin)
- `PUT /api/stores/:id` - Actualizar (admin)

### Ponches
- `GET /api/punches` - Obtener todos (admin)
- `GET /api/punches/my-punches` - Ponches propios
- `POST /api/punches` - Registrar ponche
- `GET /api/punches/stats/by-store` - Estadísticas (admin)

## 🔄 Próximas Mejoras

- [ ] Exportar reportes a Excel/PDF
- [ ] Notificaciones push
- [ ] Geolocalización para validar ponches
- [ ] Gráficas de asistencia
- [ ] Sistema de permisos y vacaciones
- [ ] Migración a base de datos SQL

## 👥 Autor

Desarrollado para sistemas de gestión empresarial

## 📄 Licencia

MIT
