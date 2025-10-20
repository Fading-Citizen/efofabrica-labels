



































# 🏭 EFO Label GeneratorSistema profesional de generación e impresión masiva de etiquetas industriales para cables de fibra óptica.

---

## 📋 Descripción

EFO Label Generator es una aplicación web desarrollada específicamente para **EFO Fábrica** que permite generar códigos secuenciales únicos e imprimir etiquetas para diferentes tipos de cables de fibra óptica (PatchCords, Pigtails y Bobinas) de múltiples marcas (EFO, RIMPORT, COENTEL).

### ✨ Características Principales

- 🏷️ **10 tipos de etiquetas** configurables
- 📊 **Generación masiva** de hasta 1000 etiquetas por lote
- 🎯 **Ajuste visual preciso** de posiciones con editor drag-and-drop
- ☁️ **Sincronización en la nube** con Supabase
- 📄 **Exportación a PDF** lista para impresión térmica
- 🖨️ **Integración directa** con impresoras térmicas
- 💾 **Persistencia de configuraciones** entre dispositivos
- 🎨 **Plantillas JPG personalizadas** para cada tipo de etiqueta
---

## 🚀 Acceso Rápido

### Aplicación Web
**URL de Producción:** [Desplegar en Vercel](https://vercel.com)

### Secciones Principales

1. **Generador Principal** (`/`) - Generar y exportar etiquetas
2. **Ajustador de Coordenadas** (`/adjust`) - Calibrar posiciones de texto

---

## 📦 Tipos de Etiquetas Disponibles

| Tipo | Prefijo | Marca | Campos |
|------|---------|-------|--------|
| PatchCord | PC | EFO | ILA1, ILA2, RLA1, RLA2 |
| PatchCord | PCR | RIMPORT | ILA1, ILA2, RLA1, RLA2 |
| PatchCord | PCC | COENTEL | ILA1, ILA2, RLA1, RLA2 |
| PatchCord Duplex | PCD | EFO | ILA1, ILA2, RLA1, RLA2 |
| PatchCord Duplex | PCDR | RIMPORT | ILA1, ILA2, RLA1, RLA2 |
| PatchCord Duplex | PCDC | COENTEL | ILA1, ILA2, RLA1, RLA2 |
| Pigtail | PT | EFO | ILA1, ILA2 |
| Pigtail | PTR | RIMPORT | ILA1, ILA2 |
| Pigtail | PTC | COENTEL | ILA1, ILA2 |
| Bobina | BB | - | ILA1, ILA2 |

**Formato de código:** `PREFIJO-XXXXXX` (ejemplo: `PC-000001`)

---

## 🎯 Guía de Uso

### 1️⃣ Generar Etiquetas

1. Accede a la página principal
2. Selecciona el **tipo de etiqueta** del panel izquierdo
3. Ingresa la **cantidad** deseada (1-1000)
4. Click en **"GENERAR CÓDIGOS"**
5. Click en **"GENERAR PDF"**
6. El PDF se descargará automáticamente y se abrirá la ventana de impresión

**Resultado:** Archivo PDF con todas las etiquetas listas para imprimir en formato 80x60mm.

---

### 2️⃣ Ajustar Posiciones (Calibración)

**¿Cuándo usar?** Cuando las etiquetas impresas no coinciden exactamente con el diseño de la plantilla.

#### Pasos:

1. Click en el botón **"⚙️ Ajustar Coordenadas"** (esquina superior derecha)

2. **Selecciona el tipo de etiqueta** a calibrar

3. **Ajusta los campos de texto:**
   - Verás rectángulos de colores sobre la plantilla
   - 🔴 **ILA1** - Primera etiqueta izquierda
   - 🔵 **ILA2** - Segunda etiqueta izquierda
   - 🟢 **RLA1** - Primera etiqueta derecha (A1:)
   - 🟡 **RLA2** - Segunda etiqueta derecha (A2:)

4. **Arrastra cada rectángulo** hasta la posición correcta
   - El punto rojo en la esquina inferior izquierda marca la posición exacta
   - La línea roja inferior indica donde se asentará el texto

5. **Ajusta el tamaño de fuente** usando los botones +/− si es necesario

6. **Guarda los cambios:**
   - Click en **"💾 Guardar"**
   - Verás una confirmación verde

7. **Vuelve al generador** para probar las nuevas coordenadas

#### Controles del Editor:

- **Zoom:** Botones − y + (50% - 200%)
- **Grid:** Mostrar/ocultar cuadrícula de referencia
- **Labels:** Mostrar/ocultar coordenadas numéricas
- **Undo/Redo:** ↩️ ↪️ para deshacer cambios

---

## 🖨️ Configuración de Impresora

### Especificaciones Técnicas

- **Tamaño de etiqueta:** 80mm × 60mm
- **Formato PDF:** 226.77pt × 170.08pt
- **Orientación:** Horizontal (Landscape)
- **Tipo:** Impresora térmica

### Impresoras Compatibles

El sistema genera PDFs estándar compatibles con cualquier impresora térmica de etiquetas. Impresoras recomendadas:

- Zebra ZD420
- Brother QL-series
- DYMO LabelWriter
- TSC TE/TTP series

---

## 💻 Instalación y Desarrollo

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (opcional, para sincronización en la nube)

### Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/Fading-Citizen/efofabrica-labels.git

# Navegar al proyecto
cd efofabrica-labels/label-generator

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev

# Abrir navegador
http://localhost:3000
```

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
# Supabase Configuration (requerido para sincronización en la nube)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

---

## 🚀 Despliegue en Vercel

### Paso 1: Preparar el Repositorio

Asegúrate de que tu código esté en GitHub.

### Paso 2: Importar a Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Click en **"Add New Project"**
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js

### Paso 3: Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL = tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = tu_supabase_anon_key
```

3. Selecciona los entornos: **Production**, **Preview**, **Development**

### Paso 4: Deploy

Click en **"Deploy"** y espera unos minutos.

**¡Listo!** Tu aplicación estará disponible en: `https://tu-proyecto.vercel.app`

---

## 🛠️ Tecnologías Utilizadas

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Supabase** - Base de datos PostgreSQL en la nube
- **jsPDF** - Generación de PDFs
- **Tailwind CSS** - Estilos
- **React Hot Toast** - Notificaciones

---

## 🔧 Solución de Problemas

### ❓ "Las etiquetas salen desalineadas"

**Solución:**
1. Ve a `/adjust`
2. Selecciona el tipo de etiqueta problemático
3. Arrastra los campos a las posiciones correctas
4. Guarda y vuelve a generar el PDF

---

### ❓ "No puedo guardar las coordenadas"

**Posibles causas:**
- Sin conexión a internet
- Error temporal de Supabase

**Solución:**
- Verifica tu conexión a internet
- Recarga la página (F5)
- Si persiste, contacta al administrador

---

### ❓ "El texto es muy grande/pequeño"

**Solución:**
1. Ve a `/adjust`
2. Usa los botones **+/−** en "Tamaño de Fuente"
3. El rectángulo se ajustará en tiempo real
4. Guarda los cambios

---

## 💡 Consejos y Buenas Prácticas

### ✅ Calibración Inicial

**Primera vez usando el sistema:**

1. Genera 1 etiqueta de prueba para cada tipo
2. Imprime y verifica la posición del texto
3. Si está desalineado, usa el editor `/adjust` para corregir
4. Repite hasta que esté perfecto
5. Las coordenadas se guardan automáticamente en la nube

### ✅ Uso Diario

- **No necesitas calibrar cada vez** - Las coordenadas se mantienen guardadas
- **Genera lotes grandes** - El sistema soporta hasta 1000 etiquetas
- **Revisa siempre la primera etiqueta** de cada lote antes de imprimir todas

### ✅ Múltiples Dispositivos

- Las coordenadas calibradas **se sincronizan automáticamente**
- Puedes calibrar en una PC y usar en otra sin problemas
- Requiere conexión a internet para sincronizar

---

## 📊 Navegadores Compatibles

- ✅ Chrome/Edge (Recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

---

## 🔐 Seguridad y Privacidad

### ✅ Almacenamiento de Datos

- **Coordenadas**: Se guardan en la nube (Supabase) para sincronización entre dispositivos
- **Códigos generados**: Se guardan localmente en tu navegador (localStorage)
- **No se envían datos sensibles**: Solo coordenadas de posición de texto

### ✅ Backup Automático

- Las coordenadas se respaldan automáticamente en la nube
- El historial de códigos se mantiene en el navegador
- **Importante**: Limpiar datos del navegador borrará el historial local de códigos

### ✅ Acceso

- Sistema privado para uso interno de EFO
- Solo accesible mediante la URL específica
- No requiere inicio de sesión (por diseño)

---

## 🔧 Mantenimiento

### Limpiar Historial Local

Para resetear todos los códigos generados (no afecta las coordenadas guardadas):

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Escribe y ejecuta:
   ```javascript
   localStorage.removeItem('efo_label_data');
   ```
4. Recarga la página (F5)

### Backup de Códigos Generados

Para exportar tu historial de códigos:

1. Abre la consola del navegador (F12)
2. Escribe y ejecuta:
   ```javascript
   const data = localStorage.getItem('efo_label_data');
   console.log(JSON.stringify(JSON.parse(data), null, 2));
   ```
3. Copia el resultado y guárdalo en un archivo de texto

---

## 📞 Soporte y Contacto

**¿Necesitas ayuda?**

1. Revisa la sección [Solución de Problemas](#-solución-de-problemas)
2. Contacta al administrador del sistema
3. Para problemas técnicos urgentes, proporciona:
   - Tipo de etiqueta problemático
   - Descripción detallada del error
   - Capturas de pantalla si es posible

---

## 📝 Checklist de Primera Configuración

### ⚠️ Antes de Usar en Producción

- [ ] Calibrar coordenadas de los 10 tipos de etiquetas
- [ ] Probar impresión de cada tipo
- [ ] Verificar que la impresora esté configurada correctamente (80x60mm)
- [ ] Confirmar que las etiquetas impresas son legibles
- [ ] Imprimir 1 etiqueta de prueba de cada tipo antes de lotes grandes

### ⚠️ Mantenimiento Regular

- Las coordenadas guardadas son **permanentes** y no se pierden
- Si cambias de rollo de etiquetas (diferente fabricante), puede requerir recalibración
- Si cambias de impresora, verifica la calibración antes de usar
- Revisa periódicamente la alineación de las etiquetas

---

## 📋 Resumen Rápido

### 🚀 Para Generar Etiquetas:
1. Abre `http://localhost:3002/` (o tu URL de producción)
2. Selecciona tipo → Ingresa cantidad → Genera → Imprime

### ⚙️ Para Ajustar Posiciones:
1. Abre `http://localhost:3002/adjust`
2. Selecciona tipo → Arrastra campos → Guarda

**¡Eso es todo! 🎉**

---

## 📄 Licencia y Propiedad

- **Uso interno exclusivo**: Sistema desarrollado para EFO Fábrica
- **Confidencial**: No distribuir fuera de la organización
- **Copyright**: © 2025 EFO Fábrica - Todos los derechos reservados

---

## 🏷️ Información del Proyecto

**Versión**: 1.0.0  
**Última actualización**: Enero 2025  
**Desarrollado para**: EFO Fábrica  
**Sistema**: Generador de Etiquetas Industriales  
**Soporte**: Departamento de IT de EFO
