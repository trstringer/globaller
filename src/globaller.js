const program = require('commander');
const package = require('../package');
const chalk = require('chalk');
const fs = require('fs');
const exec = require('child_process').exec;

function displaySuccess(message) {
  console.log(chalk.green(message));
}

function displayVerbose(message) {
  if (program.verbose) {
    console.log(chalk.yellow(message));
  }
}

function displayError(message) {
  console.log(chalk.red(message));
}

function importPackageJson() {
  const cwd = process.cwd();
  displayVerbose(`cwd is ${cwd}`);

  return require(`${cwd}/package.json`);
}

function globalPath() {
  // currently only support for Linux and macOS
  return '/usr/local/bin';
}

function createSymLink(packageBin) {
  return new Promise((resolve, reject) => {
    const newBinName = `${packageBin.name}-${program.postfix || 'dev'}`;
    const newBinAndPath = `${globalPath()}/${newBinName}`;
    fs.symlink(packageBin.path, newBinAndPath, (err) => {
      if (err) {
        reject(err);
      }
      else {
        // unfortunately we have to use exec() here as fs.chmod() 
        // is not seemingly setting the appropriate permissions
        exec(`chmod 755 ${newBinAndPath}`, (err) => {
          if (err) {
            reject(err);
          }
          else {
            displayVerbose(`sucess chmod 755 on ${newBinAndPath}`);
            resolve(newBinName);
          }
        });
      }
    });
  });
}

function binConfig(packageJson) {
  let bin = {};
  if (typeof packageJson.bin === 'object') {
    // at this point the format of bin is 
    // { "binname": "binpath" }
    const binRelPath = packageJson.bin[Object.keys(packageJson.bin)[0]]; 

    bin.name = Object.keys(packageJson.bin)[0];
    bin.path = `${process.cwd()}/${binRelPath}`;
  }
  else {
    // the bin is a string with the path and 
    // we need to use the package name as the bin name
    bin.name = packageJson.name;
    bin.path = `${process.cwd()}/${packageJson.bin}`;
  }

  displayVerbose(`transformed bin '${bin.name} : ${bin.path}'`);

  return bin;
}

program
  .version(package.version)
  .option('-v, --verbose', 'display verbose logging')
  .option('-p, --postfix [postfix]', 'add non-default postfix to global module (default is "-dev")')
  .parse(process.argv);

try {
  const packageJson = importPackageJson();
  displayVerbose(`successfully read package json for '${packageJson.name}'`);

  if (!packageJson.bin) {
    displayError('no bin indicator in package json');
    process.exit(1);
  }

  const packageBin = binConfig(packageJson);
  createSymLink(packageBin)
    .then((newBinName) => {
      displaySuccess(`successfully created symlink '${newBinName}'`);
      process.exit(0);
    })
    .catch((err) => {
      displayError(err.message);
      process.exit(1);
    });
}
catch (ex) {
  displayError(ex.message);
  process.exit(1);
}
