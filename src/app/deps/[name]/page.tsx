import { RecurseiveDependencies } from '@/DTO';
import TreeChart from '@/components/TreeChart';

function removeVersonSpecialCharacters(version: string) {
  return version.replace('^', '').replace('~', '');
}

async function getPackageData(name: string) {
  const response = await fetch(`https://registry.npmjs.org/${name}`);

  const data = await response.json();

  const version = data['dist-tags'].latest || data['dist-tags'].next || '';

  return {
    name,
    version,
  };
}

async function getPackageDependencies({
  name,
  version,
  includeDevDependencies = false,
}: {
  name: string;
  version: string;
  includeDevDependencies?: boolean;
}) {
  const response = await fetch(`https://registry.npmjs.org/${name}/${version}`);

  const data = await response.json();

  if (!data.dependencies)
    return {
      name,
      version,
      dependencies: [],
      devDependencies: [],
    };

  const dependencies = Object.entries(data.dependencies).map(
    ([key, value]) => ({
      name: key,
      version: removeVersonSpecialCharacters(String(value)),
    })
  );

  const devDependencies = !includeDevDependencies
    ? []
    : Object.entries(data.devDependencies).map(([key, value]) => ({
        name: key,
        version: removeVersonSpecialCharacters(String(value)),
      }));

  return {
    name,
    version,
    dependencies,
    devDependencies,
  };
}

async function getDependenciesRecursively({
  name,
  version,
  includeDevDependencies = false,
}: {
  name: string;
  version: string;
  includeDevDependencies?: boolean;
}): Promise<RecurseiveDependencies> {
  const { dependencies, devDependencies } = await getPackageDependencies({
    name,
    version,
    includeDevDependencies,
  });

  const dependenciesPromises = dependencies.map((dependency) =>
    getDependenciesRecursively({
      name: dependency.name,
      version: dependency.version,
    })
  );

  const devDependenciesPromises = !includeDevDependencies
    ? []
    : devDependencies.map((dependency) =>
        getDependenciesRecursively({
          name: dependency.name,
          version: dependency.version,
        })
      );

  const dependenciesData = await Promise.all(dependenciesPromises);

  const devDependenciesData = await Promise.all(devDependenciesPromises);

  return {
    name,
    version,
    dependencies: dependenciesData,
    devDependencies: devDependenciesData,
  };
}

const Deps = async ({
  params: { name },
  searchParams: { includeDev },
}: {
  params: { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const { version } = await getPackageData(name);

  const includeDevDependencies = !includeDev ? false : includeDev === 'true';

  const packageData = await getPackageDependencies({
    name,
    version,
    includeDevDependencies,
  });

  const allDependencies = getDependenciesRecursively({
    name,
    version,
    includeDevDependencies,
  });

  const [allData] = await Promise.all([allDependencies]);

  return (
    <div className='w-[100vw] h-[100vh]'>
      <div className='flex flex-row justify-start items-center p-4 gap-2'>
        <h1 className='text-2xl'>
          Deps Of {packageData.name}@{packageData.version}
        </h1>

        <div className='flex flex-row gap-4'>
          {includeDevDependencies ? (
            <a
              href={`/deps/${name}?includeDev=false`}
              className='bg-zinc-600 text-white px-4 py-2 rounded-md hover:bg-zinc-500'
            >
              Only Prod Dependencies
            </a>
          ) : (
            <a
              href={`/deps/${name}?includeDev=true`}
              className='bg-zinc-600 text-white px-4 py-2 rounded-md hover:bg-zinc-500'
            >
              Include Dev Dependencies
            </a>
          )}
        </div>

        <h1 className='bg-zinc-600 text-white px-4 py-2 rounded-md hover:bg-zinc-500 w-fit'>
          <a href='/'>Home</a>
        </h1>
      </div>

      <TreeChart library={packageData.name} dependencies={allData} />
    </div>
  );
};

export default Deps;
