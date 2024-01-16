import CONFIG from './const';
import mkdirp from 'mkdirp';
import fs from 'fs';
import path from 'path';
import { clipboard, dialog } from 'electron';
import spawn from 'cross-spawn';

export function checkCertInstalled() {
  return fs.existsSync(CONFIG.INSTALL_CERT_FLAG);
}

export async function installCert(checkInstalled = true) {
  if (checkInstalled && checkCertInstalled()) {
    return;
  }

  mkdirp.sync(path.dirname(CONFIG.INSTALL_CERT_FLAG));

  if (process.platform === 'darwin') {
    return new Promise((resolve, reject) => {
      clipboard.writeText(
        `echo "Please enter you sudo password" && sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${CONFIG.CERT_PUBLIC_PATH}" &&  touch ${CONFIG.INSTALL_CERT_FLAG} && echo "The installation is complete"`,
      );
      dialog.showMessageBoxSync({
        type: 'info',
        message: `The command has been copied to the clipboard, paste the command into the terminal and run to install and trust the certificate`,
      });

      reject();
    });
  } else {
    return new Promise((resolve, reject) => {
      const result = spawn.sync(CONFIG.WIN_CERT_INSTALL_HELPER, [
        '-c',
        '-add',
        CONFIG.CERT_PUBLIC_PATH,
        '-s',
        'root',
      ]);

      if (result.stdout.toString().indexOf('Succeeded') > -1) {
        fs.writeFileSync(CONFIG.INSTALL_CERT_FLAG, '');
        resolve();
      } else {
        reject();
      }
    });
  }
}
