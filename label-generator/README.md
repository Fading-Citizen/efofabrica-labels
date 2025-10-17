# EFO Label Generator

Sistema de generación e impresión masiva de etiquetas industriales para EFO Fábrica.

## Características

✅ **Sistema 100% Local** - Sin base de datos externa, usa localStorage
✅ **Generación Secuencial** - Códigos únicos por tipo de producto
✅ **10 Tipos de Etiquetas** - PatchCord, Pigtail, Bobina y variantes
✅ **Impresión Térmica PDF** - Formato 80mm x 60mm estándar industrial
✅ **Diseño Profesional** - Interfaz estilo oficina, colores corporativos
✅ **Descarga Automática** - PDF listo para imprimir en masa

## Tipos de Etiquetas Soportados

1. **PatchCord EFO** (PC-XXXXXX)
2. **PatchCord RIMPORT** (PCR-XXXXXX)
3. **PatchCord COENTEL** (PCC-XXXXXX)
4. **PatchCord Duplex EFO** (PCD-XXXXXX)
5. **PatchCord Duplex RIMPORT** (PCDR-XXXXXX)
6. **PatchCord Duplex COENTEL** (PCDC-XXXXXX)
7. **Pigtail EFO** (PT-XXXXXX)
8. **Pigtail RIMPORT** (PTR-XXXXXX)
9. **Pigtail COENTEL** (PTC-XXXXXX)
10. **Bobina** (BB-XXXXXX)

## Tecnologías

- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **jsPDF** - Generación de PDFs
- **localStorage** - Persistencia de datos local
- **React Hot Toast** - Notificaciones

## Instalación Local

```bash
# Clonar repositorio
git clone [tu-repo]

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir navegador
http://localhost:3000
```

## Despliegue en Vercel

### Opción 1: Desde el CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Deploy desde la carpeta del proyecto
cd label-generator
vercel

# Para producción
vercel --prod
```

### Opción 2: Desde la Web

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js
5. Click en "Deploy"

**¡Listo!** Tu app estará disponible en: `https://tu-proyecto.vercel.app`

## Variables de Entorno (Opcional)

No se requieren variables de entorno porque el sistema usa localStorage.

Si deseas personalizar:

```env
NEXT_PUBLIC_APP_NAME=EFO Label Generator
NEXT_PUBLIC_STORAGE_TYPE=local
```

## Uso del Sistema

### 1. Seleccionar Tipo de Etiqueta
- Haz click en el tipo de producto desde el panel izquierdo

### 2. Ingresar Cantidad
- Especifica cuántas etiquetas necesitas (1-1000)

### 3. Generar Códigos
- Click en "GENERAR CÓDIGOS"
- Los códigos se crean secuencialmente
- Se guardan automáticamente en localStorage

### 4. Imprimir PDF
- Click en "IMPRIMIR PDF"
- Se descarga automáticamente el PDF
- Se abre ventana de impresión
- Las etiquetas se marcan como impresas

## Formato de Etiquetas (80mm x 60mm)

Cada etiqueta incluye:
- Logo EFO
- Tipo de producto
- Código único (grande y centrado)
- Fecha de generación
- Número de secuencia
- Borde de seguridad

## Persistencia de Datos

- Todos los códigos generados se guardan en localStorage
- Los últimos números por tipo se mantienen entre sesiones
- Historial completo de etiquetas generadas e impresas
- No se pierden datos al cerrar el navegador

## Soporte Navegadores

- Chrome/Edge (Recomendado)
- Firefox
- Safari
- Opera

## Impresoras Compatibles

- Cualquier impresora térmica estándar 80mm
- Impresoras de oficina (ajustar configuración a 80x60mm)
- PDF se puede enviar a impresora de red

## Estructura del Proyecto

```
label-generator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── labels/
│   │   │       ├── generate/route.ts
│   │   │       ├── print/route.ts
│   │   │       └── stats/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── LabelGeneratorSimple.tsx
│   ├── lib/
│   │   ├── labelTypes.ts
│   │   └── localLabelGenerator.ts
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
└── next.config.js
```

## Mantenimiento

### Limpiar Datos
Para resetear todos los códigos generados:
```javascript
// En la consola del navegador:
localStorage.removeItem('efo_label_data');
```

### Backup de Datos
```javascript
// Exportar datos:
const data = localStorage.getItem('efo_label_data');
console.log(data); // Copiar y guardar
```

## Troubleshooting

**Problema**: No se generan códigos
- Solución: Verificar que localStorage esté habilitado en el navegador

**Problema**: PDF no se descarga
- Solución: Habilitar descargas automáticas en el navegador

**Problema**: Ventana de impresión no se abre
- Solución: Permitir ventanas emergentes para el sitio

## Licencia

Uso interno exclusivo de EFO Fábrica.

## Soporte

Para soporte técnico, contactar al departamento de IT de EFO.

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025  
**Desarrollado para**: EFO Fábrica
