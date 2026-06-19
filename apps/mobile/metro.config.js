const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Debug: log all module resolutions that start with @
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@')) {
    console.log(`[RESOLVER DEBUG] moduleName="${moduleName}" platform="${platform}"`);
  }
  if (moduleName.startsWith('@/')) {
    const relativePath = moduleName.slice(2);
    const srcDir = path.resolve(projectRoot, 'src');
    const candidateDir = path.join(srcDir, relativePath);

    // If it's a directory, look for index files
    if (fs.existsSync(candidateDir) && fs.statSync(candidateDir).isDirectory()) {
      const exts = ['.tsx', '.ts', '.jsx', '.js'];
      for (const ext of exts) {
        const idx = path.join(candidateDir, `index${ext}`);
        if (fs.existsSync(idx)) {
          console.log(`[RESOLVER DEBUG] Resolved @/ alias (dir) -> ${idx}`);
          return { filePath: idx, type: 'sourceFile' };
        }
      }
    }

    // Try common extensions
    const exts = ['.tsx', '.ts', '.jsx', '.js'];
    for (const ext of exts) {
      const filePath = candidateDir + ext;
      if (fs.existsSync(filePath)) {
        console.log(`[RESOLVER DEBUG] Resolved @/ alias -> ${filePath}`);
        return { filePath, type: 'sourceFile' };
      }
    }
    console.log(`[RESOLVER DEBUG] Could NOT resolve @/ alias: ${moduleName}`);
  }

  // Fallback to original resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
