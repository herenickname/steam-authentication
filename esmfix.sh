for file in dist/esm/*.js; do 
  mv "$file" "${file%.js}.mjs"; 
done