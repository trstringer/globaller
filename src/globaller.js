const program = require('commander');
const package = require('../package');
const chalk = require('chalk');

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

function binConfig(packageJson) {
  let bin = {};
  if (typeof packageJson.bin === 'object') {
    // at this point the format of bin is 
    // { "binname": "binpath" }
    bin = packageJson.bin;
    const binRelPath = bin[Object.keys(bin)[0]]; 
    bin[Object.keys(bin)[0]] = `${process.cwd()}/${binRelPath}`;
  }
  else {
    // the bin is a string with the path and 
    // we need to use the package name as the bin name
    bin[packageJson.name] = `${process.cwd()}/${packageJson.bin}`
  }

  displayVerbose(`transformed bin ${bin}`);
}

program
  .version(package.version)
  .option('-v, --verbose', 'display verbose logging')
  .option('-p, --postfix', 'add non-default postfix to global module (default is "-dev")')
  .parse(process.argv);

try {
  const packageJson = importPackageJson();
  displayVerbose(`successfully read package json for '${packageJson.name}'`);

  if (!packageJson.bin) {
    displayError('no bin indicator in package json');
    process.exit(1);
  }
}
catch (ex) {
  displayError('unable to access package json');
  process.exit(1);
}
