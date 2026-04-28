# Skill: Testing

> **Scope**: Backend (Node/Express) y Frontend (Vue/Quasar). Lee la sección correspondiente según el contexto del cambio.

## Principios universales

- Test behavior, not implementation
- Tests deben ser deterministas e independientes entre sí
- Cubrir tanto el happy path como los casos de error
- Sin dependencias de orden de ejecución

---

## Backend — Node/Express (vitest + integración real)

### Filosofía
- Preferir integration tests sobre mocks — probar el stack real evita divergencias
- La base de datos/estado se resetea entre tests — nunca compartir estado mutable

### Scope
Test:
- Lógica de negocio (services)
- Comportamiento HTTP (controllers + routes)
- Flujos críticos (auth, permisos, validación de inputs)

No test:
- Definiciones de tipos
- Utilidades de infraestructura de terceros
- Internals de @synkos/server

### Estructura
- Cada test configura su propio estado/datos
- Estado reseteado antes de cada test
- Sin estado global compartido entre tests
- Sin dependencia de orden de ejecución

### Assertions
- Siempre assert: status code + estructura de respuesta
- Para errores: assert el código de error (`error.code`)
- Para éxito: assert los campos clave del `data`

### Async
- Solo async/await — sin callbacks ni timers
- Manejar explícitamente las promise rejections

---

## Frontend — Vue/Quasar (vitest + @vue/test-utils)

### Filosofía
- Testear comportamiento observable: qué ve el usuario, qué emite el componente
- Mocks aceptables para: @synkos/client stores, router, APIs externas
- No testear internals de Quasar ni de @synkos/ui

### Scope
Test:
- Interacciones de usuario (clicks, inputs, formularios)
- Lógica de composables (valores retornados, efectos secundarios)
- Renderizado condicional basado en props/estado

No test:
- Estilos o clases CSS (frágil, no describe comportamiento)
- Internals de librerías (Quasar, @synkos/ui)
- Animaciones o transiciones

### Estructura
- Montar el componente con `mount()` de @vue/test-utils
- Proveer mocks de stores via `createTestingPinia()`
- Limpiar entre tests (unmount + limpiar mocks)

### Assertions
- `wrapper.text()` o `wrapper.find()` para contenido visible
- `wrapper.emitted()` para eventos
- `store.method` para efectos en stores

---

## Anti-Patterns (universales)

- Mocks del comportamiento core en lugar de testear el real
- Tests que siempre pasan sin assertions significativas
- Estado compartido entre tests
- Testear detalles de implementación en lugar de resultados
- Ignorar los casos de error

---

## Checklist

- Happy path cubierto
- Casos de error cubiertos
- Tests son independientes
- Sin estado oculto compartido
- Assertions son significativas
- Lógica nueva tiene tests
