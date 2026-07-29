const fs = require('fs');
const path = require('path');
const notifier = require('node-notifier');

const ROOT_DIR = process.env.INPUT_PATH || './';
const TARGET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.gif'];
const EXCLUDED_DIRS = ['node_modules', '.git', '.github', 'dist', 'build'];
const IS_DELETE = process.argv.includes('--delete');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(ROOT_DIR, filePath);
    
    if (EXCLUDED_DIRS.some(ex => relativePath.startsWith(ex))) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(relativePath);
    }
  });
  return fileList;
}

function showNotification(title, message) {
  notifier.notify({
    title: title,
    message: message,
    sound: true,
    wait: false
  });
}

function runCleaner() {
  console.log('Scanning repository for unused files...');
  const allFiles = getAllFiles(ROOT_DIR);
  const assets = allFiles.filter(file => TARGET_EXTENSIONS.includes(path.extname(file).toLowerCase()));
  const sourceFiles = allFiles.filter(file => !TARGET_EXTENSIONS.includes(path.extname(file).toLowerCase()));

  let codebaseContent = '';
  sourceFiles.forEach(file => {
    try {
      codebaseContent += fs.readFileSync(path.join(ROOT_DIR, file), 'utf8') + '\n';
    } catch (e) {
      // Skip unreadable files
    }
  });

  const unusedFiles = assets.filter(asset => {
    const fileName = path.basename(asset);
    return !codebaseContent.includes(fileName);
  });

  // Notification 1: Scan complete (if not running with --delete yet)
  if (!IS_DELETE) {
    showNotification(
      'Unused files scan complete. 🧹', 
      'To proceed, go to Unused File Scanner and click "Delete files".'
    );
    console.log(`Scan complete! Found ${unusedFiles.length} unused files.`);
    return;
  }

  // Handle Deletion Process
  let deletedCount = 0;
  let hasError = false;

  if (IS_DELETE && unusedFiles.length > 0) {
    unusedFiles.forEach(file => {
      const fullPath = path.join(ROOT_DIR, file);
      try {
        fs.unlinkSync(fullPath);
        deletedCount++;
      } catch (err) {
        hasError = true;
        console.error(`Failed to delete ${file}:`, err.message);
        
        // Notification 3: Error when a file can't be deleted
        showNotification(
          'Cannot delete files!', 
          `Error code: 200 Reason: files run the file cleaner! delete on your own`
        );
      }
    });
  }

  // Notification 2: Deletion complete (sent to Recycle Bin / removed successfully)
  if (!hasError && deletedCount > 0) {
    showNotification(
      'File deletion complete. 🗑️', 
      'Files are now in the Recycle Bin'
    );
    console.log(`Successfully deleted ${deletedCount} files.`);
  } else if (unusedFiles.length === 0) {
    console.log('No unused files found to delete.');
  }
}

runCleaner();