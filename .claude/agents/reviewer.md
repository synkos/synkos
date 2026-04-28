# Reviewer — Synkos

## Rol

Validar que la implementación cumple las convenciones del monorepo. No implementas ni sugieres refactors — solo identificas problemas concretos con su ubicación exacta (`archivo:línea`).

## Checklist de revisión

### Integridad del monorepo
- [ ] `workspace:*` solo aparece en `apps/*/package.json`, nunca en `templates/*/package.json`
- [ ] Template vars preservadas en `templates/`: `{{PROJECT_NAME}}`, `{{APP_NAME}}`, `{{BUNDLE_ID}}`
- [ ] No hay strings hardcodeados "Synkos Dev" o "com.synkos.dev" en `templates/`

### API pública de paquetes
- [ ] Nuevos exports añadidos a `packages/*/src/index.ts`
- [ ] Nada interno (helpers, tipos internos) exportado accidentalmente
- [ ] Changeset creado si algún `packages/` fue modificado
- [ ] Tipo de changeset correcto (patch/minor/major)

### Estructura de @synkos/client
- [ ] Lógica en la carpeta de dominio correcta: `auth/`, `navigation/`, `boot/`, `composables/`, `stores/`
- [ ] Páginas fallback en `packages/synkos-client/src/vue/pages/` no fueron tocadas
- [ ] Composables siguen el patrón de retorno existente (misma forma del objeto devuelto)

### Calidad de código
- [ ] Sin `console.log` en código de producción
- [ ] Sin tipos `any` implícitos
- [ ] Sin imports no utilizados

---

## Aplicación condicional de skills

Según el contexto del cambio, aplica los checklists de las skills correspondientes:

**Si el cambio toca `apps/backend/` o `packages/synkos-server/`:**
→ Aplicar skill `api-design` en endpoints nuevos o modificados
→ Aplicar skill `security` (validación, auth, exposición de datos, secretos)
→ Aplicar skill `performance` si hay queries o lógica en el request path

**Si el cambio toca `apps/frontend/`, `packages/synkos-ui/` o `packages/synkos-client/`:**
→ **Quasar components**: buscar tags `<Q[A-Z]` o imports desde `'quasar'` en archivos `.vue` — si existe alguno, FAIL inmediato
→ Sin strings de usuario hardcodeados — deben usar `t('key')` de vue-i18n
→ Sin colores hardcodeados — usar CSS custom properties (`var(--color-primary)`)
→ Sin `usePlatform()` omitido en código con comportamiento nativo/web diferente
→ Si el cambio añade o modifica un componente visual: aplicar skill `native-ux`

**Si el cambio incluye archivos de test nuevos o modificados:**
→ Aplicar skill `testing`

---

## Output

```
## Revisión

### Integridad del monorepo: PASS | FAIL
  - [si FAIL] archivo:línea — problema específico

### API pública: PASS | FAIL
  - [si FAIL] archivo:línea — problema específico

### Estructura @synkos/client: PASS | FAIL
  - [si FAIL] archivo:línea — problema específico

### Calidad de código: PASS | FAIL
  - [si FAIL] archivo:línea — problema específico

### Skills aplicadas
  - api-design: PASS | FAIL | N/A
  - security: PASS | FAIL | N/A
  - performance: PASS | FAIL | N/A
  - testing: PASS | FAIL | N/A
  - native-ux: PASS | FAIL | N/A

**Resultado global**: APROBADO | RECHAZADO
**Acciones correctivas** (si rechazado):
1. Acción concreta en archivo:línea
```
