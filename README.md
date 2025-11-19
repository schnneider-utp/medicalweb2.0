<table>
  <tr>
    <td align="center" width="42%">
      <img src="public/pepemedico.png" alt="Pepe Médico" width="360" />
    </td>
    <td align="left">
      <h1>Pepe Contador</h1>
      <p><em>Gestión de archivos y procesos contables con IA y RAG</em></p>
      <p>
        <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white" />
        <img alt="React" src="https://img.shields.io/badge/React-20232a?logo=react&logoColor=61DAFB" />
        <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
        <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white" />
        <br/>
        <img alt="Radix UI" src="https://img.shields.io/badge/Radix%20UI-161618?logo=radixui&logoColor=white" />
        <img alt="Google Generative AI" src="https://img.shields.io/badge/Google%20Generative%20AI-4285F4?logo=google&logoColor=white" />
        <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white" />
      </p>
      <p>
        <a href="#instalación">Instalación</a> • <a href="#uso">Uso</a> • <a href="#variables-de-entorno-env">.env</a>
      </p>
    </td>
  </tr>
</table>

# Pepe Contador

Aplicación web para: subir archivos a Google Drive, activar procesos contables vía webhooks, gestionar un chat contable con IA y usar RAG sobre documentos subidos.

## 👥 Desarrolladores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/schnneider-utp" target="_blank">
        <img src="https://github.com/schnneider-utp.png" width="80" style="border-radius:50%;" />
        <br/>
        <sub><b>Jean Schnneider Arias Suarez</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/JuanesUTP" target="_blank">
        <img src="https://github.com/JuanesUTP.png" width="80" style="border-radius:50%;" />
        <br/>
        <sub><b>Juan Esteban Jaramillo Cano</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/wolsybl" target="_blank">
        <img src="https://github.com/wolsybl.png" width="80" style="border-radius:50%;" />
        <br/>
        <sub><b>Wilson Andres Henao Soto</b></sub>
      </a>
    </td>
  </tr>
</table>


# Medical Imaging Diagnosis Agent

## Descripción del Proyecto

El Medical Imaging Diagnosis Agent es una aplicación web avanzada diseñada para asistir en el análisis preliminar de imágenes médicas utilizando inteligencia artificial a través de la API de Google Gemini. Esta herramienta permite a profesionales de la salud y estudiantes de medicina obtener un análisis inicial de imágenes médicas y mantener conversaciones contextuales sobre los hallazgos.

La aplicación combina capacidades de análisis de imágenes con un sistema de chat inteligente que mantiene el contexto de análisis previos, proporcionando una experiencia integrada para la interpretación asistida de imágenes médicas.

## Características Principales

- **Análisis de Imágenes Médicas**: Procesamiento y análisis de radiografías, resonancias, tomografías y otros tipos de imágenes médicas
- **Chat Médico Contextual**: Sistema de chat que incorpora información de análisis previos para responder consultas
- **Interfaz Responsiva**: Diseño adaptable a diferentes dispositivos y tamaños de pantalla
- **Estadísticas de Uso**: Panel de métricas para seguimiento de actividad del sistema
- **Mecanismos de Seguridad**: Filtrado de contenido inapropiado y enmascaramiento de datos sensibles
- **Despliegue Simplificado**: Configuración optimizada para despliegue en Vercel

## Requisitos Técnicos

### Requisitos de Software
- **Node.js**: Versión 18.x o superior
- **npm**: Versión 9.x o superior
- **Navegador Web**: Chrome, Firefox, Safari o Edge (versiones actualizadas)

### Dependencias Principales
- **Next.js 14**: Framework de React para renderizado del lado del servidor
- **React 18**: Biblioteca para construcción de interfaces
- **Tailwind CSS**: Framework de utilidades CSS para el diseño
- **Google Generative AI SDK**: Para interacción con la API de Gemini

### Requisitos de API
- **API Key de Google AI (Gemini)**: Necesaria para acceder a los modelos de IA de Google
  - Modelo utilizado: gemini-2.0-flash
  - [Obtener API Key](https://ai.google.dev/)
## Cómo Obtener tu API Key de Google Gemini

### Pasos para Configurar la API Key

### 1. Acceder a Google AI Studio
**Enlace directo**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
tambien el enlace se encuentra debajo del bloque donde se pone la api key en el software web 

### 2. Iniciar Sesión
- Utiliza tu cuenta de Google (Gmail)
- Si no tienes cuenta, créala gratuitamente

### 3. Crear la API Key
1. Haz clic en **"Create API Key"** (Crear clave API)
2. Selecciona o crea un proyecto de Google Cloud
3. Copia la clave API generada (empieza con `AIza...`)

### 4. Configurar en la Aplicación
1. Abre la aplicación Medical Imaging Diagnosis Agent
2. Busca el campo **"Google Gemini API Key"**
3. Pega la API Key que copiaste
4. Haz clic en **"Guardar API Key"**

## Información Importante

### Plan Gratuito
- **60 solicitudes por minuto**
- **1,500 solicitudes por día**
- Suficiente para uso educativo

### Seguridad
- La API Key se almacena **solo en tu navegador**
- **No se envía** a nuestros servidores
- Puedes eliminarla cuando quieras

## Instalación y Configuración

### Instalación Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/schnneider-utp/medicalweb2.0
   cd medicalweb2.0
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**:
   Abrir [http://localhost:3000](http://localhost:3000) en el navegador

### Despliegue en Producción (Vercel)

#### Opción 1: Despliegue desde GitHub
1. Subir el código a un repositorio de GitHub
2. Iniciar sesión en [Vercel](https://vercel.com)
3. Hacer clic en "New Project"
4. Importar el repositorio de GitHub
5. Configurar variables de entorno (opcional)
6. Hacer clic en "Deploy"

#### Opción 2: Despliegue con Vercel CLI
1. Instalar Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navegar a la carpeta del proyecto:
   ```bash
   cd medical-web
   ```

3. Iniciar sesión en Vercel:
   ```bash
   vercel login
   ```

4. Desplegar el proyecto:
   ```bash
   vercel
   ```

5. Para producción:
   ```bash
   vercel --prod
   ```

## Guía de Uso

### Configuración Inicial
1. Al acceder por primera vez, se solicitará una API Key de Google Gemini
2. Ingresar la API Key en el campo correspondiente y hacer clic en "Guardar"
3. La API Key se almacenará localmente en el navegador para futuras sesiones

### Análisis de Imágenes
1. Seleccionar la pestaña "Análisis de Imagen"
2. Hacer clic en "Seleccionar Imagen" o arrastrar una imagen médica al área designada
3. La imagen se mostrará en la vista previa
4. Hacer clic en "Analizar Imagen"
5. El sistema procesará la imagen y mostrará un análisis estructurado con:
   - Tipo de imagen
   - Hallazgos clave
   - Evaluación diagnóstica
   - Explicación para el paciente
   - Contexto de investigación

### Uso del Chat Médico
1. Seleccionar la pestaña "Chat"
2. Escribir una consulta relacionada con la imagen analizada o cualquier otra pregunta médica
3. El sistema responderá utilizando el contexto de análisis previos cuando sea relevante
4. El historial de chat se mantiene durante la sesión

### Visualización de Estadísticas
1. Navegar a la sección de estadísticas
2. Revisar métricas de uso como número de análisis, consultas de chat, etc.

## Arquitectura del Sistema

### Componentes Principales
- **Interfaz de Usuario**: Implementada con React y Tailwind CSS
- **API Routes**: Endpoints de Next.js para procesamiento de solicitudes
- **Servicios de Seguridad**: Filtrado de contenido y enmascaramiento de datos sensibles
- **Integración con IA**: Conexión con la API de Google Gemini

### Flujo de Datos
1. El usuario sube una imagen o envía un mensaje de chat
2. La solicitud pasa por validaciones de seguridad
3. Se procesa mediante la API de Google Gemini
4. La respuesta se filtra para enmascarar datos sensibles
5. Se presenta el resultado al usuario con formato estructurado

```mermaid
graph TD

    subgraph medicalWebAppBoundary["Medical Web Application<br>/c:/Users/jaena/Downloads/medicalweb"]
        subgraph nextjsFrontendBoundary["Next.js Frontend<br>/c:/Users/jaena/Downloads/medicalweb/app"]
            homePage["Home Page<br>/c:/Users/jaena/Downloads/medicalweb/app/page.tsx"]
            layout["Layout<br>/c:/Users/jaena/Downloads/medicalweb/app/layout.tsx"]
            loadingIndicator["Loading Indicator<br>/c:/Users/jaena/Downloads/medicalweb/app/loading.tsx"]
            acceptanceMetrics["Acceptance Metrics<br>/c:/Users/jaena/Downloads/medicalweb/app/components/AcceptanceMetrics.tsx"]
            medicalTextRenderer["Medical Text Renderer<br>/c:/Users/jaena/Downloads/medicalweb/components/MedicalTextRenderer.tsx"]
            themeProvider["Theme Provider<br>/c:/Users/jaena/Downloads/medicalweb/components/theme-provider.tsx"]
            uiComponents["UI Components<br>/c:/Users/jaena/Downloads/medicalweb/components/ui"]
            %% Edges at this level (grouped by source)
            homePage["Home Page<br>/c:/Users/jaena/Downloads/medicalweb/app/page.tsx"] -->|"Uses"| layout["Layout<br>/c:/Users/jaena/Downloads/medicalweb/app/layout.tsx"]
            homePage["Home Page<br>/c:/Users/jaena/Downloads/medicalweb/app/page.tsx"] -->|"Displays when loading"| loadingIndicator["Loading Indicator<br>/c:/Users/jaena/Downloads/medicalweb/app/loading.tsx"]
            homePage["Home Page<br>/c:/Users/jaena/Downloads/medicalweb/app/page.tsx"] -->|"Includes"| acceptanceMetrics["Acceptance Metrics<br>/c:/Users/jaena/Downloads/medicalweb/app/components/AcceptanceMetrics.tsx"]
            homePage["Home Page<br>/c:/Users/jaena/Downloads/medicalweb/app/page.tsx"] -->|"Includes"| medicalTextRenderer["Medical Text Renderer<br>/c:/Users/jaena/Downloads/medicalweb/components/MedicalTextRenderer.tsx"]
            homePage["Home Page<br>/c:/Users/jaena/Downloads/medicalweb/app/page.tsx"] -->|"Uses various"| uiComponents["UI Components<br>/c:/Users/jaena/Downloads/medicalweb/components/ui"]
            layout["Layout<br>/c:/Users/jaena/Downloads/medicalweb/app/layout.tsx"] -->|"Uses"| themeProvider["Theme Provider<br>/c:/Users/jaena/Downloads/medicalweb/components/theme-provider.tsx"]
        end
        subgraph nextjsBackendBoundary["Next.js Backend (API Routes)<br>/c:/Users/jaena/Downloads/medicalweb/app/api"]
            analysisApi["Analysis API<br>/c:/Users/jaena/Downloads/medicalweb/app/api/analyze/route.ts"]
            chatApi["Chat API<br>/c:/Users/jaena/Downloads/medicalweb/app/api/chat/route.ts"]
        end
        %% Edges at this level (grouped by source)
        homePage["Home Page<br>/c:/Users/jaena/Downloads/medicalweb/app/page.tsx"] -->|"Requests analysis data | HTTPS/JSON"| analysisApi["Analysis API<br>/c:/Users/jaena/Downloads/medicalweb/app/api/analyze/route.ts"]
        homePage["Home Page<br>/c:/Users/jaena/Downloads/medicalweb/app/page.tsx"] -->|"Sends chat messages | HTTPS/JSON"| chatApi["Chat API<br>/c:/Users/jaena/Downloads/medicalweb/app/api/chat/route.ts"]
    end

```


## Seguridad y Privacidad

La aplicación implementa varias capas de seguridad:

- **Filtrado de Contenido**: Detección y bloqueo de contenido inapropiado
- **Enmascaramiento de Datos**: Protección automática de información sensible como:
  - Números de identificación (DNI, SSN)
  - Números de teléfono
  - Tarjetas de crédito
  - Direcciones de correo electrónico
  - Direcciones IP


## Limitaciones Actuales y Mejoras Futuras

### Limitaciones
- **Búsqueda de Contexto Básica**: Actualmente utiliza coincidencia simple de palabras clave
- **Sin Persistencia de Datos**: Los análisis y chats se almacenan solo en memoria durante la sesión
- **Dependencia de API Key del Usuario**: Requiere que cada usuario proporcione su propia API Key

### Mejoras Planificadas
- **Implementación de RAG (Retrieval Augmented Generation)**:
  - Generación de embeddings para análisis médicos
  - Almacenamiento en base de datos vectorial
  - Búsqueda semántica para mejor recuperación de contexto
- **Almacenamiento Persistente**: Base de datos para guardar análisis y conversaciones
- **Autenticación de Usuarios**: Sistema de login para profesionales médicos
- **Expansión de Capacidades de Análisis**: Soporte para más tipos de imágenes médicas

## Notas Importantes

- **Uso Educativo**: Esta aplicación está diseñada solo para fines educativos e informativos
- **No Diagnóstico Oficial**: Todos los análisis deben ser revisados por profesionales de la salud calificados
- **Complemento, No Sustituto**: No tomar decisiones médicas basadas únicamente en este análisis
- **Privacidad**: Las imágenes y datos se procesan en el servidor pero no se almacenan permanentemente

## Tecnologías y Frameworks Utilizados

### Framework Principal
- **Next.js**: v14.2.16 - Framework de React para renderizado del lado del servidor
- **React**: v18 - Biblioteca para construcción de interfaces de usuario
- **TypeScript**: v5 - Superset tipado de JavaScript

### Componentes de UI
- **Radix UI**: Biblioteca completa de componentes accesibles y sin estilos
  - Componentes disponibles: Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, etc.
- **Lucide React**: v0.454.0 - Biblioteca de iconos
- **Geist**: Fuente y sistema de diseño de Vercel
- **Embla Carousel**: Carrusel de imágenes y contenido
- **React Day Picker**: Selector de fechas
- **Sonner**: Sistema de notificaciones
- **Vaul**: Componentes de drawer/modal

### Estilos y CSS
- **Tailwind CSS**: v4.1.9 - Framework de utilidades CSS
- **Tailwind Merge**: v2.5.5 - Utilidad para combinar clases de Tailwind
- **Tailwind Animate**: v1.0.7 - Animaciones para Tailwind
- **Class Variance Authority**: v0.7.1 - Creación de variantes de componentes
- **CLSX**: v2.1.1 - Utilidad para construcción condicional de nombres de clase

### Formularios y Validación
- **React Hook Form**: Manejo de formularios
- **Zod**: v3.25.67 - Validación de esquemas
- **@hookform/resolvers**: v3.10.0 - Integraciones para React Hook Form

### Visualización de Datos
- **Recharts**: Biblioteca de gráficos y visualizaciones
- **React Resizable Panels**: Paneles redimensionables

### Utilidades y Herramientas
- **Sharp**: Procesamiento de imágenes
- **Canvas**: Manipulación de gráficos
- **Date-fns**: v4.1.0 - Utilidades para manejo de fechas

### Análisis y Monitoreo
- **@vercel/analytics**: Análisis y métricas de uso

### Herramientas de Desarrollo
- **PostCSS**: v8.5 - Procesador de CSS
- **Autoprefixer**: v10.4.20 - Añade prefijos de navegador automáticamente
- **ESLint**: Linting de código
- **@types/node**: v22 - Tipos de TypeScript para Node.js
- **@types/react**: v18 - Tipos de TypeScript para React
- **@types/react-dom**: v18 - Tipos de TypeScript para React DOM

### Temas y Apariencia
- **next-themes**: Sistema de temas claro/oscuro

### Modelo de IA
- **IA**: Google Gemini API (modelo gemini-2.0-flash)

