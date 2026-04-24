---
'create-synkos': patch
---
fix .npmrc not copied to generated project — npm excludes dotfiles starting with . when publishing, so .npmrc was renamed to npmrc during build and restored by scaffold
