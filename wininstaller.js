const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'releases')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'CxWorkLogger-win32-ia32/'),
    authors: 'Riaz Laskar',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'CxWorkLogger.exe',
    setupExe: 'CxWorkLoggerAppInstaller.exe',
    setupIcon: path.join(rootPath, 'public', 'images', 'icon.ico'),
    iconUrl: "http://riazxrazor.in/icon.ico",
    loadingGif : path.join(rootPath, 'public', 'images', 'installer.gif')
  })
}