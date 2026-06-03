import * as ts from "./typescript.js";

const tsCode = `
  const multiply = (a: number, b: number): number => {
    return a * b;
  };
  console.log(multiply(5, 5));
`;

// Transpile the TypeScript string
const result = ts.transpileModule(tsCode, {
  compilerOptions: { 
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
});



console.log(result.outputText);