for file in dist/esm/*.js; do 
  mv "$file" "${file%.js}.mjs"; 
done

for file in dist/esm/*.mjs; do
  sed -i '' -e "s/from '\(.*\)'/from '\1.mjs'/g" "$file"
done