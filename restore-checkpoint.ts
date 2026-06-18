import fs from 'fs';
import path from 'path';

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const backupDir = './src_checkpoint_backup';
if (!fs.existsSync(backupDir)) {
  console.error('Error: No checkpoint backup found at "./src_checkpoint_backup"!');
  process.exit(1);
}

if (fs.existsSync('./src')) {
  fs.rmSync('./src', { recursive: true, force: true });
}
copyRecursiveSync(backupDir, './src');
console.log('Checkpoint restored successfully! The directory "./src" has been restored with the files saved in "./src_checkpoint_backup".');
