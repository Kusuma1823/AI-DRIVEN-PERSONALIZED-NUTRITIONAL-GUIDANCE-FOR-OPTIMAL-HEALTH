/// <reference types="vite/client" />

// Declare raw file imports for CSV files
declare module '*foods_dataset_150.csv?raw' {
  const content: string;
  export default content;
}

declare module '*food_ingredients_dataset_150.csv?raw' {
  const content: string;
  export default content;
}

declare module '*foods_dataset_1500.csv?raw' {
  const content: string;
  export default content;
}

declare module '*food_ingredients_dataset_1500.csv?raw' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
