import { readdirSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';
import { defineConfig } from 'vite';

const PROJECT_MODULE_ID = 'virtual:project-gallery';
const RESOLVED_PROJECT_MODULE_ID = `\0${PROJECT_MODULE_ID}`;
const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.m4v', '.mov', '.mp4', '.ogv', '.webm']);
const PROJECT_TITLE_OVERRIDES = new Map([
  ['medilanka echanneling', 'MediLanka E-Channeling'],
  ['online course system', 'Online Course System'],
  ['wearora online shopping', 'Wearora Online Shopping'],
  ['3d cone', '3D Cone'],
  ['f1 car 2026', 'F1 Car 2026'],
  ['rb19 f1', 'RB22 F1'],
]);

function getProjectGroups(projectsDirectory) {
  const groupDirectories = readdirSync(projectsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => {
      const preferredOrder = ['development', 'design'];
      const leftIndex = preferredOrder.indexOf(left.name.toLowerCase());
      const rightIndex = preferredOrder.indexOf(right.name.toLowerCase());
      if (leftIndex !== -1 || rightIndex !== -1) {
        return (leftIndex === -1 ? preferredOrder.length : leftIndex)
          - (rightIndex === -1 ? preferredOrder.length : rightIndex);
      }
      return left.name.localeCompare(right.name);
    });

  return groupDirectories.map((directory) => {
    const groupPath = join(projectsDirectory, directory.name);
    const projectsByName = new Map();
    const mediaFiles = readdirSync(groupPath, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    for (const fileName of mediaFiles) {
      const extension = extname(fileName).toLowerCase();
      const isImage = IMAGE_EXTENSIONS.has(extension);
      if (!isImage && !VIDEO_EXTENSIONS.has(extension)) continue;

      const name = fileName.slice(0, -extname(fileName).length);
      const key = name.toLocaleLowerCase('en-US');
      const project = projectsByName.get(key) ?? { name: PROJECT_TITLE_OVERRIDES.get(key) ?? name };
      const mediaPath = `/images/projects/${encodeURIComponent(directory.name)}/${encodeURIComponent(fileName)}`;
      if (isImage && !project.image) project.image = mediaPath;
      if (!isImage && !project.video) project.video = mediaPath;
      projectsByName.set(key, project);
    }

    return {
      name: directory.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
      id: `${directory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-projects`,
      projects: [...projectsByName.values()].sort((left, right) => left.name.localeCompare(right.name)),
    };
  });
}

function projectGalleryPlugin() {
  let projectsDirectory;

  return {
    name: 'project-gallery',
    configResolved(config) {
      projectsDirectory = resolve(config.publicDir, 'images', 'projects');
    },
    resolveId(id) {
      if (id === PROJECT_MODULE_ID) return RESOLVED_PROJECT_MODULE_ID;
    },
    load(id) {
      if (id !== RESOLVED_PROJECT_MODULE_ID) return;
      return `export default ${JSON.stringify(getProjectGroups(projectsDirectory))};`;
    },
    configureServer(server) {
      server.watcher.add(projectsDirectory);
      server.watcher.on('all', (event, filePath) => {
        const relativePath = relative(projectsDirectory, resolve(filePath));
        if (relativePath === '' || relativePath === '..' || relativePath.startsWith(`..${sep}`)) return;
        if (!['add', 'addDir', 'change', 'unlink', 'unlinkDir'].includes(event)) return;

        const module = server.moduleGraph.getModuleById(RESOLVED_PROJECT_MODULE_ID);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig({
  plugins: [projectGalleryPlugin()],
});
