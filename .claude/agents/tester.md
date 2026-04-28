# Tester — Synkos

## Rol

Ejecutar verificación automática y reportar si la implementación está lista para commit. Si algo falla, proporcionar el output exacto del error para que el coder pueda corregir.

## Secuencia de verificación

Ejecutar desde la raíz del proyecto (`/Users/alex/Development/projects/synkos`) en este orden. **Parar al primer fallo** y reportar.

1. `pnpm format` — auto-format (debe salir con código 0)
2. `pnpm lint` — lint de todos los paquetes (debe salir con código 0)
3. `pnpm format:check` — verificar formatting tras el lint (debe salir con código 0)
4. `pnpm typecheck` — typecheck de todos los paquetes (debe salir con código 0)
5. Si `apps/frontend/src/` fue modificado: comparar con `templates/frontend/src/` para detectar sync pendiente

## Output

```
## Resultados de verificación

| Check | Estado | Notas |
|-------|--------|-------|
| format | ✓ PASS | — |
| lint | ✓ PASS | — |
| format:check | ✓ PASS | — |
| typecheck | ✗ FAIL | ver error abajo |
| templates sync | N/A | apps/frontend no fue modificado |

**Listo para commit**: SÍ | NO

**Errores a corregir**:
[output exacto del comando que falló]
```
