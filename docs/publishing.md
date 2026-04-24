# Flujo de publicación en npm

## Visión general

El monorepo usa **Changesets** para versionar paquetes de forma independiente y **GitHub Actions** para publicar en npm automáticamente. El flujo completo tiene dos fases:

1. **Fase de desarrollo** — haces cambios y describes qué versión bump merecen
2. **Fase de publicación** — CI detecta los changesets, crea una PR de versioning, y al mergearla publica en npm

---

## Paso a paso

### 1. Hacer cambios en el código

Trabaja con normalidad. Cuando termines los cambios que quieras publicar, pasa al paso 2.

### 2. Crear un changeset

Un changeset es un archivo `.md` en `.changeset/` que describe qué paquetes cambian y con qué tipo de bump semver.

```bash
pnpm changeset
```

El CLI te preguntará:

- **¿Qué paquetes cambian?** — selecciona con espacio, confirma con enter
- **¿Es un major, minor o patch?**
  - `patch` — bug fix, cambio interno sin impacto en la API (0.2.0 → 0.2.1)
  - `minor` — nueva funcionalidad retrocompatible (0.2.0 → 0.3.0)
  - `major` — breaking change (0.2.0 → 1.0.0)
- **Descripción del cambio** — una línea, aparecerá en el CHANGELOG

Esto crea un archivo como `.changeset/algun-nombre-random.md`. Commitéalo junto con tus cambios.

> **Alternativa manual:** puedes crear el archivo directamente sin el CLI:
>
> ```markdown
> ---
> 'nombre-paquete': patch
> ---
>
> fix: descripción del cambio
> ```

### 3. Commitear y pushear a main

```bash
git add .
git commit -m "feat: descripción de los cambios"
git push origin main
```

El changeset `.md` debe ir en el commit. Si el `.gitignore` lo excluye (no debería, ya está corregido), usa `git add -f .changeset/tu-archivo.md`.

### 4. CI crea la PR de versioning

Al detectar changesets pendientes en `main`, el workflow `release.yml` crea automáticamente una PR llamada **"chore: version packages"** que:

- Bumpa la versión en cada `package.json` afectado
- Actualiza cada `CHANGELOG.md`
- Elimina los archivos `.changeset/*.md` ya procesados

Puedes acumular varios changesets antes de mergear esta PR — todos se aplican juntos.

### 5. Mergear la PR de versioning

Ve a **GitHub → Pull Requests**, busca "chore: version packages" y mérgeala.

### 6. CI publica en npm

Al mergear, el workflow vuelve a ejecutarse. Esta vez no hay changesets pendientes, así que en lugar de crear PR ejecuta:

```
pnpm build && changeset publish
```

Esto:

1. Compila todos los paquetes (`pnpm build`)
2. Publica en npm los paquetes cuya versión en `package.json` sea mayor que la que hay en el registry

Los paquetes publicados quedan disponibles en npm inmediatamente.

---

## Diagrama del flujo

```
Tu código
    │
    ▼
pnpm changeset          ← describes el bump
    │
    ▼
git push origin main    ← con el changeset .md commiteado
    │
    ▼
CI detecta changeset
    │
    ▼
Crea PR "chore: version packages"
    │
    ▼
Tú mergas la PR
    │
    ▼
CI ejecuta pnpm build && changeset publish
    │
    ▼
Paquetes publicados en npm ✓
```

---

## Casos especiales

### Cambio que afecta a varios paquetes

Puedes listar varios paquetes en un solo changeset:

```markdown
---
'@synkos/ui': minor
'@synkos/utils': patch
---

feat: nuevos componentes en UI, fix en utils
```

O crear un changeset por paquete con `pnpm changeset` varias veces. Ambos enfoques son válidos.

### Retrigger del CI sin cambios de código

Si necesitas relanzar el workflow sin tener cambios reales:

```bash
git commit --allow-empty -m "ci: retrigger release workflow"
git push origin main
```

### Verificar qué hay pendiente de publicar

```bash
pnpm changeset status
```

Muestra los changesets pendientes y qué versión resultará en cada paquete.

### Ver qué irá en el paquete antes de publicar

```bash
cd packages/nombre-paquete
npm pack --dry-run
```

Lista todos los archivos que se incluirán en el tarball de npm.

---

## Paquetes del monorepo

| Paquete           | Descripción                                    |
| ----------------- | ---------------------------------------------- |
| `create-synkos`   | CLI scaffolding (`pnpm create synkos`)         |
| `synkos`          | Frontend core — config, plugin Vue, auth guard |
| `@synkos/ui`      | Librería de componentes iOS-styled             |
| `@synkos/server`  | Framework backend Express + Mongoose           |
| `@synkos/runtime` | Sistema de plugins isomórfico                  |
| `@synkos/utils`   | Utilidades zero-dep                            |
| `@synkos/config`  | Configuraciones compartidas ESLint/TS          |

---

## Requisitos

- **`NPM_TOKEN`** en GitHub Secrets — token de tipo _Classic Automation_ en npmjs.com. Los tokens Granular no funcionan para publicar paquetes fuera del scope `@synkos`.
- **GitHub Actions permissions** — en Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests" debe estar activado.
