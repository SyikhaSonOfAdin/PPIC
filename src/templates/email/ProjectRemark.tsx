import React from 'react';
import { Html, Tailwind } from '@react-email/components';

export default function ProjectRemark(props: { url: string }) {
  return (
    <Html>
      <Tailwind
        config={{
          plugins: [require('daisyui')],
          // Opsi tambahan theme/custom bisa ditambahkan di sini
        }}
      >
        <div className="p-6 bg-base-100">
          <h1 className="text-xl font-bold">Halo!</h1>
          <button className="mt-4">
            Klik di sini
          </button>
        </div>
      </Tailwind>
    </Html>
  );
}
