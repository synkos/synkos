# synkos CLI

El paquete `synkos` expone un binario `synkos` que encapsula comandos de tooling específicos del framework. El objetivo es mantener el proyecto del usuario libre de scripts de infraestructura que no debería tocar, y que cualquier corrección o mejora llegue vía `pnpm update synkos` sin ningún cambio manual.

---

## Por qué existe

Quasar tiene un bug en su script `open-ide.js`: al abrir el proyecto en Xcode elige `App.xcodeproj` en lugar de `App.xcworkspace` porque `readdirSync` devuelve los archivos en orden alfabético y `.xcodeproj` precede a `.xcworkspace`. Xcode abre el proyecto incorrecto y la compilación falla.

La solución es inyectar un wrapper del comando `open` en el PATH antes de que Quasar lo llame. Ese wrapper detecta cualquier argumento `.xcodeproj` y lo redirige a su `.xcworkspace` equivalente.

En lugar de distribuir ese script como un archivo `scripts/dev-ios.mjs` dentro de cada proyecto generado por `pnpm create synkos` — lo que obliga al usuario a mantenerlo y le impide recibir actualizaciones — la lógica vive en el paquete `synkos` y se invoca como `synkos dev ios`.

---

## Comandos disponibles

### `synkos dev ios`

Lanza el entorno de desarrollo de Quasar para iOS (Capacitor) corrigiendo el bug de apertura de Xcode.

```bash
pnpm dev:ios
# equivale a: synkos dev ios
```

Internamente ejecuta `quasar dev -m capacitor -T ios` con el PATH modificado para que el `open` inyectado intercepte la llamada a Xcode.

---

## Dónde vive el código

```
packages/synkos/
└── src/
    └── bin.ts        ← entrada del CLI (compilada a dist/bin.js)
```

`tsup.config.ts` compila `src/bin.ts` como una entrada separada de la librería principal:

- La librería (`src/index.ts`) se compila a ESM + CJS con `platform: neutral` — funciona en browser y Node.
- El bin (`src/bin.ts`) se compila solo a ESM con `platform: node` y añade el shebang `#!/usr/bin/env node` via `banner`.

El `package.json` del paquete registra el binario:

```json
"bin": {
  "synkos": "./dist/bin.js"
}
```

Cuando el usuario instala el paquete (o pnpm lo enlaza vía `workspace:*` en el monorepo), el binario queda disponible en `node_modules/.bin/synkos`.

---

## Cómo añadir un nuevo comando

1. Añade la rama en `src/bin.ts`:

```ts
if (command === 'dev' && target === 'android') {
  devAndroid();
}

function devAndroid(): void {
  // lógica aquí
}
```

2. Compila el paquete:

```bash
pnpm --filter synkos build
```

3. El binario en `apps/frontend/node_modules/.bin/synkos` se actualiza automáticamente porque apunta al `dist/` via symlink de workspace.

4. Si el comando nuevo debe estar en el template del usuario, actualiza `apps/frontend/package.json` y luego ejecuta `pnpm sync:templates` para propagar el cambio.

---

## Cómo llegan las actualizaciones a los usuarios

Cuando corriges un bug o añades un comando al CLI:

1. Aplica el cambio en `packages/synkos/src/bin.ts`
2. Crea un changeset: `pnpm changeset` → `patch` (corrección) o `minor` (nuevo comando)
3. Publica: `pnpm release`

El usuario de un proyecto generado con `pnpm create synkos` actualiza con:

```bash
pnpm update synkos
```

No necesita modificar ningún archivo de su proyecto. El `package.json` de su proyecto tiene `"dev:ios": "synkos dev ios"` — el comando sigue siendo el mismo, solo cambia la implementación dentro del paquete.

---

## Relación con sync-templates

El script `scripts/sync-templates.mjs` trata `synkos` como un paquete **first-party publicado**: en lugar de excluirlo (como hace con `@synkos/ui` u otros paquetes internos que usan `workspace:*`), lo convierte a su versión real leyendo `packages/synkos/package.json`.

```js
const FIRST_PARTY_PACKAGES = {
  synkos: path.join(ROOT, 'packages', 'synkos', 'package.json'),
};
```

Cuando haces bump de versión de `synkos` y ejecutas `pnpm sync:templates`, el `templates/frontend/package.json` se actualiza automáticamente a `"synkos": "^{nueva_versión}"`.
