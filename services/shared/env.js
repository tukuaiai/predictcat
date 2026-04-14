/**
 * PredictCat 共享环境变量引导层
 *
 * 加载顺序（后者覆盖前者）：
 * 1. 仓库根目录 .env
 * 2. 仓库根目录 .env.local
 * 3. 当前服务目录 .env
 * 4. 当前服务目录 .env.local
 */

const fs = require('fs');
const path = require('path');

const MAX_SEARCH_DEPTH = 12;

const isProjectRoot = (dir) => {
  return (
    fs.existsSync(path.join(dir, 'pyproject.toml'))
    && fs.existsSync(path.join(dir, 'src', 'predict'))
    && fs.existsSync(path.join(dir, 'services'))
  );
};

const findProjectRoot = (startDir) => {
  let dir = path.resolve(startDir);
  for (let i = 0; i < MAX_SEARCH_DEPTH; i += 1) {
    if (isProjectRoot(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
};

const findServiceRoot = (startDir, projectRoot) => {
  let dir = path.resolve(startDir);
  for (let i = 0; i < MAX_SEARCH_DEPTH; i += 1) {
    if (path.dirname(dir) === path.join(projectRoot, 'services')) return dir;
    const parent = path.dirname(dir);
    if (parent === dir || dir === projectRoot) break;
    dir = parent;
  }
  return null;
};

const decodeValue = (rawValue) => {
  const trimmed = rawValue.trim();
  if (!trimmed) return '';

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const inner = trimmed.slice(1, -1);
    return inner
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
  }

  return trimmed;
};

const parseEnvLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
  const separatorIndex = normalized.indexOf('=');
  if (separatorIndex <= 0) return null;

  const key = normalized.slice(0, separatorIndex).trim();
  const rawValue = normalized.slice(separatorIndex + 1);
  if (!key) return null;

  return { key, value: decodeValue(rawValue) };
};

const loadEnvFile = (filePath, override = true) => {
  if (!fs.existsSync(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line) => {
    const entry = parseEnvLine(line);
    if (!entry) return;
    if (!override && Object.prototype.hasOwnProperty.call(process.env, entry.key)) return;
    process.env[entry.key] = entry.value;
  });
  return true;
};

const resolveEnvPaths = (startDir) => {
  const projectRoot = findProjectRoot(startDir);
  const serviceRoot = findServiceRoot(startDir, projectRoot);
  const candidates = [
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.local'),
  ];

  if (serviceRoot) {
    candidates.push(path.join(serviceRoot, '.env'));
    candidates.push(path.join(serviceRoot, '.env.local'));
  }

  return { projectRoot, serviceRoot, candidates };
};

const loadPredictEnv = (startDir) => {
  const state = resolveEnvPaths(startDir);
  const loadedFiles = [];

  state.candidates.forEach((candidate) => {
    if (loadEnvFile(candidate, true)) {
      loadedFiles.push(candidate);
    }
  });

  return {
    ...state,
    loadedFiles,
  };
};

module.exports = {
  findProjectRoot,
  loadPredictEnv,
  resolveEnvPaths,
};
