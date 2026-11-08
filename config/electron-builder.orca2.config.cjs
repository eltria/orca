// eltria/orca fork: packages "Orca 2", which runs beside the official Orca with its own identity and data.
const base = require('./electron-builder.config.cjs')

module.exports = {
  ...base,
  // Own bundle id: separate macOS permissions, notifications and terminal-host helper.
  appId: 'dev.eltria.orca2',
  // The package name picks userData (~/Library/Application Support/orca2) and the keychain item.
  extraMetadata: { ...base.extraMetadata, name: 'orca2' },
  // orca:// links stay with the official Orca.
  protocols: [{ name: 'Orca 2', schemes: ['orca2'] }],
  mac: {
    ...base.mac,
    // productName stays "Orca": Electron finds its helper apps by CFBundleName and the CLI shim runs MacOS/Orca.
    extendInfo: { ...base.mac.extendInfo, CFBundleDisplayName: 'Orca 2' },
    // The Computer Use helper's bundle id is fixed; an ad-hoc copy could take over the official helper's grants.
    extraResources: base.mac.extraResources.filter((entry) => entry?.to !== 'Orca Computer Use.app')
  }
}
