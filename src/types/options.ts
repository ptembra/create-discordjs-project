export default interface options {
  target: string;
  template: string;
  targetDir: string;
  templateDir: string;
  pkgManager: string;
  skipPrompts: boolean;
  runInstall: boolean;
  git: boolean;
  verbose: boolean;
}
export interface incompleteOptions {
  target: string;
  template: string;
  targetDir?: string;
  templateDir?: string;
  pkgManager: string;
  skipPrompts: boolean;
  runInstall: boolean;
  git: boolean;
  verbose: boolean;
}
