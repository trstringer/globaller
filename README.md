# Globaller

*Create global modules on your machine without having to `npm pack && npm install <local-package>`*

Why?  When I'm writing node.js CLI applications, I like to test out running the package globally.  It's convenient to just type `my-cli` instead of having to navigate to the bin.

## Installation

```
npm install --global globaller
```

## Usage

 1. Navigate to the directory of your global module that you are developing
 2. Run `globaller`
 3. Now run your global module anywhere on the system

If your module is named `mycli`, Globaller will create a symlink `mycli-<postfix>`.  You can specify a postfix by running `globaller -p test`, which will create `mycli-test`, otherwise the default postfix is `dev`.  By default, `mycli-dev` will be generated.

