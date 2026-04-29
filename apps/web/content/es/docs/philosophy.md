---
title: Filosofía
description: Los principios que dan forma a Synkos.
order: 2
---

Synkos tiene criterio. Conocer los principios te ayuda a entender por qué las cosas son como son — y cuándo discrepar.

## Convención sobre configuración

El 80% del caso no debería requerir configuración. Deberías poder ejecutar `pnpm create synkos`, construir algo real y no tocar las tripas del framework si no quieres.

Cuando sí quieras meterte, cada capa es reemplazable. Sin magia.

## Lógica headless, UI propia

El framework es dueño de la **lógica**: stores, servicios, guards. Tu proyecto es dueño de la **UI**: páginas, componentes, estilos. Proporcionamos páginas por defecto, pero en cuanto quieres personalizarlas las copias a tu proyecto y pasan a ser tuyas.

Esto hace que las actualizaciones nunca rompan tu diseño.

## Mobile-first, listo para web

Synkos está construido para apps móviles que además corren en web — no para apps web que también funcionan en móvil. Gestos táctiles, transiciones nativas, títulos grandes, biometría. La build de web es el mismo código, simplemente sin el puente nativo.

## Vertical, no horizontal

En lugar de ser una capa fina sobre muchas herramientas, Synkos elige un pequeño número de opiniones y las integra profundamente. Vue + Capacitor + Pinia + vue-i18n. Ese es el contrato. No vamos a añadir otro router ni otra librería de estado.

Si necesitas un stack distinto, este no es tu framework. Es perfectamente válido.
