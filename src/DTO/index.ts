export type RecurseiveDependencies = {
  name: string;
  version: string;
  dependencies: RecurseiveDependencies[];
  devDependencies: RecurseiveDependencies[];
};
