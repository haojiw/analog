const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.sourceExts = ['ts', 'tsx', ...config.resolver.sourceExts];

// Force react and react-native to a single resolved path, preventing the
// "multiple copies of React" error caused by npm workspace hoisting.
const forcedModules = {
  react: require.resolve('react'),
  'react-native': require.resolve('react-native'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (forcedModules[moduleName]) {
    return { filePath: forcedModules[moduleName], type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
