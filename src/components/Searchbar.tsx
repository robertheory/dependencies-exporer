'use client';

import { PackageSearchResult } from '@/DTO';
import { Router, useRouter } from 'next/router';
import { useState } from 'react';

const Searchbar = () => {
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<PackageSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSearch() {
    if (search.length === 0) return;

    setIsLoading(true);
    const res = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=keywords:${search}`
    );
    const data = await res.json();

    setResults(data.objects);

    setIsLoading(false);
  }

  return (
    <div className='flex flex-col p-4 justify-start items-center gap-4 bg-slate-400 w-[100%] h-[100vh]'>
      <button
        className='bg-zinc-600 text-white px-4 py-2 rounded-md hover:bg-zinc-500'
        onClick={() => handleSearch()}
        disabled={isLoading}
      >
        Search
      </button>

      <input
        disabled={isLoading}
        type='text'
        placeholder='Search'
        className='bg-zinc-600 text-white px-4 py-2 rounded-md hover:bg-zinc-500 w-96'
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      {isLoading ? (
        <h1 className='text-2xl'>Loading...</h1>
      ) : results.length === 0 ? (
        <h1 className='text-2xl'>Search something</h1>
      ) : (
        <ul className='bg-zinc-600 text-white overflow-scroll rounded-md'>
          {results.map((result) => (
            <li
              key={result.package.name}
              className='p-4 hover:bg-zinc-500 text-white w-96 rounded-md'
              onClick={() => {
                window.location.href = `/deps/${result.package.name}`;
              }}
            >
              {result.package.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Searchbar;
